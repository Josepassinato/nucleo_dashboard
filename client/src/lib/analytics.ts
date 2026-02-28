/**
 * Analytics Tracking Helper
 * Tracks user conversions, events, and interactions
 */

export interface AnalyticsEvent {
  eventName: string;
  eventCategory: string;
  eventValue?: number;
  eventLabel?: string;
  userId?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface ConversionEvent extends AnalyticsEvent {
  conversionType: "signup" | "payment" | "upgrade" | "downgrade" | "cancel" | "feature_use";
  planId?: string;
  amount?: number;
  currency?: string;
}

class AnalyticsTracker {
  private events: AnalyticsEvent[] = [];
  private conversionEvents: ConversionEvent[] = [];

  /**
   * Track a generic event
   */
  trackEvent(event: AnalyticsEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };

    this.events.push(enrichedEvent);
    console.log("[Analytics] Event tracked:", enrichedEvent);

    // Send to analytics service (e.g., Google Analytics, Mixpanel, etc.)
    this.sendToAnalyticsService(enrichedEvent);
  }

  /**
   * Track a conversion event
   */
  trackConversion(event: ConversionEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };

    this.conversionEvents.push(enrichedEvent);
    console.log("[Analytics] Conversion tracked:", enrichedEvent);

    // Send to analytics service
    this.sendToAnalyticsService(enrichedEvent);

    // Track in conversion tracking service
    this.trackConversionMetrics(enrichedEvent);
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, pageUrl?: string) {
    this.trackEvent({
      eventName: "page_view",
      eventCategory: "engagement",
      eventLabel: pageName,
      metadata: {
        url: pageUrl || window.location.href,
        referrer: document.referrer,
      },
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName: string, buttonCategory: string) {
    this.trackEvent({
      eventName: "button_click",
      eventCategory: buttonCategory,
      eventLabel: buttonName,
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formName: string, success: boolean, errorMessage?: string) {
    this.trackEvent({
      eventName: "form_submission",
      eventCategory: "engagement",
      eventLabel: formName,
      metadata: {
        success,
        error: errorMessage,
      },
    });
  }

  /**
   * Track signup conversion
   */
  trackSignup(userId: string, planId?: string) {
    this.trackConversion({
      eventName: "signup",
      eventCategory: "conversion",
      conversionType: "signup",
      userId,
      planId,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track payment conversion
   */
  trackPayment(userId: string, amount: number, currency: string, planId: string) {
    this.trackConversion({
      eventName: "payment",
      eventCategory: "conversion",
      conversionType: "payment",
      userId,
      amount,
      currency,
      planId,
      eventValue: amount,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track plan upgrade
   */
  trackUpgrade(userId: string, fromPlan: string, toPlan: string, amount: number) {
    this.trackConversion({
      eventName: "upgrade",
      eventCategory: "conversion",
      conversionType: "upgrade",
      userId,
      planId: toPlan,
      amount,
      eventValue: amount,
      metadata: {
        fromPlan,
        toPlan,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track plan downgrade
   */
  trackDowngrade(userId: string, fromPlan: string, toPlan: string) {
    this.trackConversion({
      eventName: "downgrade",
      eventCategory: "conversion",
      conversionType: "downgrade",
      userId,
      planId: toPlan,
      metadata: {
        fromPlan,
        toPlan,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track subscription cancellation
   */
  trackCancellation(userId: string, planId: string, reason?: string) {
    this.trackConversion({
      eventName: "cancellation",
      eventCategory: "conversion",
      conversionType: "cancel",
      userId,
      planId,
      metadata: {
        reason,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(userId: string, featureName: string, metadata?: Record<string, any>) {
    this.trackConversion({
      eventName: "feature_usage",
      eventCategory: "engagement",
      conversionType: "feature_use",
      userId,
      eventLabel: featureName,
      metadata: {
        feature: featureName,
        ...metadata,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Get conversion funnel metrics
   */
  getConversionFunnelMetrics() {
    const signups = this.conversionEvents.filter((e) => e.conversionType === "signup").length;
    const payments = this.conversionEvents.filter((e) => e.conversionType === "payment").length;
    const upgrades = this.conversionEvents.filter((e) => e.conversionType === "upgrade").length;
    const cancellations = this.conversionEvents.filter((e) => e.conversionType === "cancel").length;

    return {
      signups,
      payments,
      upgrades,
      cancellations,
      conversionRate: signups > 0 ? (payments / signups) * 100 : 0,
      retentionRate: payments > 0 ? ((payments - cancellations) / payments) * 100 : 0,
    };
  }

  /**
   * Get revenue metrics
   */
  getRevenueMetrics() {
    const totalRevenue = this.conversionEvents
      .filter((e) => e.amount)
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const paymentCount = this.conversionEvents.filter((e) => e.conversionType === "payment").length;
    const averageOrderValue = paymentCount > 0 ? totalRevenue / paymentCount : 0;

    return {
      totalRevenue,
      paymentCount,
      averageOrderValue,
    };
  }

  /**
   * Get all events
   */
  getAllEvents() {
    return {
      events: this.events,
      conversions: this.conversionEvents,
    };
  }

  /**
   * Clear events (for testing)
   */
  clearEvents() {
    this.events = [];
    this.conversionEvents = [];
  }

  /**
   * Send event to analytics service
   * This is where you'd integrate with Google Analytics, Mixpanel, etc.
   */
  private sendToAnalyticsService(event: AnalyticsEvent) {
    // Example: Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", event.eventName, {
        event_category: event.eventCategory,
        event_label: event.eventLabel,
        value: event.eventValue,
        ...event.metadata,
      });
    }

    // Example: Custom API endpoint
    try {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silently fail if analytics endpoint is not available
      });
    } catch (error) {
      console.error("[Analytics] Failed to send event:", error);
    }
  }

  /**
   * Track conversion metrics
   */
  private trackConversionMetrics(event: ConversionEvent) {
    // This could send to a conversion tracking service like Facebook Pixel, etc.
    console.log("[Analytics] Conversion metric tracked:", event.conversionType);
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

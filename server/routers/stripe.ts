import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { createSubscription, getSubscriptionByUserId, getPaymentsByUserId, createPayment } from "../db";
import { sendPaymentNotificationEmail, notifyAdminPayment } from "../_core/emailNotification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Pricing plans
export const PRICING_PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 99,
    currency: "brl",
    businesses: 1,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 299,
    currency: "brl",
    businesses: 5,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    currency: "brl",
    businesses: 999,
  },
  license: {
    id: "license",
    name: "Licença Única",
    price: 2999,
    currency: "brl",
    businesses: 999,
  },
};

export const stripeRouter = router({
  // Create checkout session
  createCheckout: protectedProcedure
    .input(
      z.object({
        planId: z.enum(["starter", "pro", "enterprise", "license"]),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const plan = PRICING_PLANS[input.planId];
      if (!plan) {
        throw new Error("Invalid plan ID");
      }

      // Rate limiting: max 10 checkout sessions per hour per user
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentCheckouts = await getPaymentsByUserId(ctx.user.id);
      const recentCount = recentCheckouts.filter(
        (p) => new Date(p.createdAt) > oneHourAgo
      ).length;
      
      if (recentCount >= 10) {
        throw new Error("Too many checkout attempts. Please try again later.");
      }

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: plan.currency,
                product_data: {
                  name: plan.name,
                  description: `Plano ${plan.name} - Núcleo Ventures`,
                },
                unit_amount: Math.round(plan.price * 100), // Stripe uses cents
              },
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            userId: ctx.user.id.toString(),
            planId: input.planId,
            userName: ctx.user.name || "Unknown",
          },
          allow_promotion_codes: true,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("[Stripe] Failed to create checkout session:", error);
        throw error;
      }
    }),

  // Get user subscription status
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscription = await getSubscriptionByUserId(ctx.user.id);
      if (!subscription) {
        return null;
      }

      // Fetch full subscription details from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );

      return {
        id: subscription.id,
        planId: subscription.planId,
        status: stripeSubscription.status,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end,
      };
    } catch (error) {
      console.error("[Stripe] Failed to get subscription:", error);
      return null;
    }
  }),

  // Get payment history
  getPayments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const payments = await getPaymentsByUserId(ctx.user.id);
      return payments;
    } catch (error) {
      console.error("[Stripe] Failed to get payments:", error);
      return [];
    }
  }),

  // Cancel subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const subscription = await getSubscriptionByUserId(ctx.user.id);
      if (!subscription) {
        throw new Error("No active subscription found");
      }

      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      return { success: true };
    } catch (error) {
      console.error("[Stripe] Failed to cancel subscription:", error);
      throw error;
    }
  }),
});

// Helper function to handle webhook events
export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<void> {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("[Stripe Webhook] Signature verification failed:", error);
    throw error;
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected:", event.type);
    return;
  }

  console.log("[Stripe Webhook] Processing event:", event.type, event.id);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[Stripe Webhook] Checkout completed:", session.id);

      if (session.client_reference_id && session.metadata?.planId) {
        const userId = parseInt(session.client_reference_id);
        const planId = session.metadata.planId;
        const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];

        try {
          // Create subscription record
          await createSubscription({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            planId,
          });

          // Send confirmation email
          if (session.customer_email && plan) {
            await sendPaymentNotificationEmail({
              userEmail: session.customer_email,
              userName: session.metadata?.userName || "Customer",
              planName: plan.name,
              amount: plan.price,
              currency: "R$",
              eventType: "subscription_created",
              invoiceUrl: session.invoice ? `https://invoice.stripe.com/${session.invoice}` : undefined,
              nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });

            // Notify admin
            await notifyAdminPayment({
              userEmail: session.customer_email,
              userName: session.metadata?.userName || "Unknown",
              planName: plan.name,
              amount: plan.price,
              currency: "R$",
              eventType: "subscription_created",
            });
          }

          console.log("[Stripe Webhook] Subscription created for user:", userId);
        } catch (error) {
          console.error("[Stripe Webhook] Failed to create subscription:", error);
        }
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("[Stripe Webhook] Invoice paid:", invoice.id);
      
      // Send payment confirmation email
      if (invoice.customer_email && (invoice as any).subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
          const planId = subscription.metadata?.planId || "unknown";
          const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
          
          await sendPaymentNotificationEmail({
            userEmail: invoice.customer_email,
            userName: subscription.metadata?.userName || "Customer",
            planName: plan?.name || "Subscription",
            amount: (invoice.amount_paid || 0) / 100,
            currency: "R$",
            eventType: "payment_success",
            invoiceUrl: invoice.hosted_invoice_url || undefined,
            nextBillingDate: new Date((subscription as any).current_period_end * 1000),
          });
        } catch (error) {
          console.error("[Stripe Webhook] Failed to send payment email:", error);
        }
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("[Stripe Webhook] Invoice payment failed:", invoice.id);
      
      // Send payment failure email
      if (invoice.customer_email && (invoice as any).subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
          const planId = subscription.metadata?.planId || "unknown";
          const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
          
          await sendPaymentNotificationEmail({
            userEmail: invoice.customer_email,
            userName: subscription.metadata?.userName || "Customer",
            planName: plan?.name || "Subscription",
            amount: (invoice.amount_due || 0) / 100,
            currency: "R$",
            eventType: "payment_failed",
          });
        } catch (error) {
          console.error("[Stripe Webhook] Failed to send failure email:", error);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("[Stripe Webhook] Subscription deleted:", subscription.id);
      
      // Send cancellation email
      if (subscription.customer && typeof subscription.customer === "object" && "email" in subscription.customer) {
        const planId = subscription.metadata?.planId || "unknown";
        const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
        
        await sendPaymentNotificationEmail({
          userEmail: subscription.customer.email as string,
          userName: subscription.metadata?.userName || "Customer",
          planName: plan?.name || "Subscription",
          amount: plan?.price || 0,
          currency: "R$",
          eventType: "subscription_cancelled",
        });
      }
      break;
    }

    default:
      console.log("[Stripe Webhook] Unhandled event type:", event.type);
  }
}



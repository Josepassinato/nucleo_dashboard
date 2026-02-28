import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { createSubscription, getSubscriptionByUserId, getPaymentsByUserId, createPayment } from "../db";

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

        try {
          // Create subscription record
          await createSubscription({
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            planId,
          });

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
      // Payment confirmed - can trigger fulfillment here
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("[Stripe Webhook] Invoice payment failed:", invoice.id);
      // Notify user of payment failure
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("[Stripe Webhook] Subscription deleted:", subscription.id);
      // Handle subscription cancellation
      break;
    }

    default:
      console.log("[Stripe Webhook] Unhandled event type:", event.type);
  }
}



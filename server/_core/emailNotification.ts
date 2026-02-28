import { invokeLLM } from "./llm";

export interface PaymentNotification {
  userEmail: string;
  userName: string;
  planName: string;
  amount: number;
  currency: string;
  eventType: "payment_success" | "payment_failed" | "subscription_created" | "subscription_cancelled";
  invoiceUrl?: string;
  nextBillingDate?: Date;
}

/**
 * Send payment notification email to user
 * Uses Manus LLM to generate personalized email content
 */
export async function sendPaymentNotificationEmail(notification: PaymentNotification): Promise<boolean> {
  try {
    const emailSubject = getEmailSubject(notification.eventType);
    const emailPrompt = generateEmailPrompt(notification);

    // Generate personalized email content using LLM
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a professional email writer for Núcleo Ventures. Generate a concise, friendly email in Portuguese (Brazil) about payment events. Keep it under 200 words.`,
        },
        {
          role: "user",
          content: emailPrompt,
        },
      ],
    });

    const emailContent = response.choices[0].message.content;

    // In production, you would send this via an email service like SendGrid, AWS SES, etc.
    // For now, we'll log it and return success
    console.log(`[Email] Sending ${notification.eventType} email to ${notification.userEmail}`);
    console.log(`[Email] Subject: ${emailSubject}`);
    console.log(`[Email] Content:\n${emailContent}`);

    // TODO: Integrate with actual email service
    // await emailService.send({
    //   to: notification.userEmail,
    //   subject: emailSubject,
    //   html: emailContent,
    // });

    return true;
  } catch (error) {
    console.error("[Email] Failed to send notification:", error);
    return false;
  }
}

/**
 * Send payment notification to admin/owner
 */
export async function notifyAdminPayment(notification: PaymentNotification): Promise<boolean> {
  try {
    const message = `
Novo evento de pagamento:
- Usuário: ${notification.userName} (${notification.userEmail})
- Plano: ${notification.planName}
- Valor: ${notification.currency} ${notification.amount}
- Evento: ${notification.eventType}
${notification.nextBillingDate ? `- Próximo pagamento: ${notification.nextBillingDate.toLocaleDateString("pt-BR")}` : ""}
    `.trim();

    console.log(`[Admin Notification] ${message}`);

    // TODO: Use notifyOwner helper from notification.ts
    // await notifyOwner({
    //   title: `Pagamento: ${notification.eventType}`,
    //   content: message,
    // });

    return true;
  } catch (error) {
    console.error("[Admin Notification] Failed:", error);
    return false;
  }
}

function getEmailSubject(eventType: string): string {
  const subjects: Record<string, string> = {
    payment_success: "✅ Pagamento Confirmado - Núcleo Ventures",
    payment_failed: "⚠️ Falha no Pagamento - Núcleo Ventures",
    subscription_created: "🎉 Bem-vindo ao Núcleo Ventures!",
    subscription_cancelled: "Sua Assinatura foi Cancelada - Núcleo Ventures",
  };
  return subjects[eventType] || "Notificação de Pagamento - Núcleo Ventures";
}

function generateEmailPrompt(notification: PaymentNotification): string {
  const prompts: Record<string, string> = {
    payment_success: `
Generate a confirmation email for a successful payment:
- Customer: ${notification.userName}
- Plan: ${notification.planName}
- Amount: ${notification.currency} ${notification.amount}
- Next billing: ${notification.nextBillingDate?.toLocaleDateString("pt-BR") || "N/A"}
- Invoice: ${notification.invoiceUrl || "Available in account"}

Make it warm, professional, and include next steps.
    `,
    payment_failed: `
Generate a payment failure notification email:
- Customer: ${notification.userName}
- Plan: ${notification.planName}
- Amount: ${notification.currency} ${notification.amount}

Be empathetic and provide clear next steps to retry payment.
    `,
    subscription_created: `
Generate a welcome email for new subscriber:
- Customer: ${notification.userName}
- Plan: ${notification.planName}
- Amount: ${notification.currency} ${notification.amount}

Include onboarding tips and support contact information.
    `,
    subscription_cancelled: `
Generate a cancellation confirmation email:
- Customer: ${notification.userName}
- Plan: ${notification.planName}

Be professional, thank them for being a customer, and offer to help if they have concerns.
    `,
  };

  return prompts[notification.eventType] || "Generate a professional payment notification email.";
}

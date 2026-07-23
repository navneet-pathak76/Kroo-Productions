import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { ContactFormSchema } from "./validation";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(data: Omit<ContactFormSchema, "company">): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const message = escapeHtml(data.message).replace(/\n/g, "<br />");

  return `
  <div style="font-family: 'General Sans', Arial, sans-serif; background:#050505; padding:40px; color:#ffffff;">
    <div style="max-width:560px; margin:0 auto; background:#111111; border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:36px;">
      <p style="color:#FF8A00; font-size:12px; letter-spacing:.2em; text-transform:uppercase; margin:0 0 18px;">New project inquiry</p>
      <h1 style="font-size:22px; margin:0 0 24px; font-weight:600;">${name}</h1>
      <p style="color:#9A9A9A; font-size:13px; margin:0 0 4px;">Email</p>
      <p style="font-size:15px; margin:0 0 20px;">${email}</p>
      <p style="color:#9A9A9A; font-size:13px; margin:0 0 4px;">Message</p>
      <p style="font-size:15px; line-height:1.7; margin:0;">${message}</p>
    </div>
  </div>`;
}

export async function sendContactEmail(
  data: Omit<ContactFormSchema, "company">
): Promise<void> {
  const fromAddress = process.env.SES_FROM_ADDRESS;
  const toAddress = process.env.SES_TO_ADDRESS;

  if (!fromAddress || !toAddress) {
    throw new Error("SES_FROM_ADDRESS and SES_TO_ADDRESS must be set.");
  }

  const command = new SendEmailCommand({
    Source: fromAddress,
    Destination: { ToAddresses: [toAddress] },
    ReplyToAddresses: [data.email],
    Message: {
      Subject: {
        Data: `New project inquiry from ${data.name}`,
        Charset: "UTF-8",
      },
      Body: {
        Html: { Data: buildEmailHtml(data), Charset: "UTF-8" },
        Text: {
          Data: `New project inquiry\n\nName: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
          Charset: "UTF-8",
        },
      },
    },
  });

  await sesClient.send(command);
}

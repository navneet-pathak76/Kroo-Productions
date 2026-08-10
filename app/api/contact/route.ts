import { NextResponse } from "next/server";
import {
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";
import { getSesClient, getSesRuntimeConfig } from "@/lib/ses";

const MAX_FIELD_LENGTH = 4000;

function toSafeString(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_FIELD_LENGTH) : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraph(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br/>");
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const name = toSafeString(payload?.name);
    const email = toSafeString(payload?.email);
    const company = toSafeString(payload?.company);
    const budget = toSafeString(payload?.budget);
    const message = toSafeString(payload?.message);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const ses = getSesClient();
    const config = getSesRuntimeConfig();

    if (!ses || !config) {
      return NextResponse.json(
        { error: "Email service is not configured." },
        { status: 503 },
      );
    }

    // Email to your team
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: config.fromEmail,
        Destination: {
          ToAddresses: [config.toEmail],
        },
        Content: {
          Simple: {
            Subject: {
              Data: `New Project Enquiry - ${name}`,
            },
            Body: {
              Html: {
                Data: `
                  <h2>New Website Enquiry</h2>

                  <p><strong>Name:</strong> ${escapeHtml(name)}</p>

                  <p><strong>Email:</strong> ${escapeHtml(email)}</p>

                  <p><strong>Company:</strong> ${escapeHtml(company || "-")}</p>

                  <p><strong>Budget:</strong> ${escapeHtml(budget || "-")}</p>

                  <hr/>

                  <h3>Project Brief</h3>

                  <p>${paragraph(message)}</p>
                `,
              },
            },
          },
        },
      })
    );
/*
    // Auto reply
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: process.env.SES_FROM_EMAIL!,
        Destination: {
          ToAddresses: [email],
        },
        Content: {
          Simple: {
            Subject: {
              Data: "We've received your enquiry | Kroo Production",
            },
            Body: {
              Html: {
                Data: `
                  <h2>Thank you, ${name} 👋</h2>

                  <p>
                    We've received your enquiry.
                  </p>

                  <p>
                    Our team will review your project and contact you within
                    24 hours.
                  </p>

                  <br/>

                  <p>
                    — Kroo Production
                  </p>
                `,
              },
            },
          },
        },
      })
    );*/

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Failed to send email.",
      },
      {
        status: 500,
      }
    );
  }
}

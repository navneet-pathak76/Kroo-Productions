import { NextResponse } from "next/server";
import {
  SendEmailCommand,
} from "@aws-sdk/client-sesv2";
import { ses } from "@/lib/ses";

export async function POST(req: Request) {
  try {
    const {
      name,
      email,
      company,
      budget,
      message,
    } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
    console.log("Region:", process.env.AWS_REGION);
    console.log(
        "Access Key:",
        process.env.AWS_ACCESS_KEY_ID?.slice(0, 8)
    );
console.log("From:", process.env.SES_FROM_EMAIL);
    // Email to your team
    await ses.send(
      new SendEmailCommand({
        FromEmailAddress: process.env.SES_FROM_EMAIL!,
        Destination: {
          ToAddresses: [process.env.SES_TO_EMAIL!],
        },
        Content: {
          Simple: {
            Subject: {
              Data: `🚀 New Project Enquiry - ${name}`,
            },
            Body: {
              Html: {
                Data: `
                  <h2>New Website Enquiry</h2>

                  <p><strong>Name:</strong> ${name}</p>

                  <p><strong>Email:</strong> ${email}</p>

                  <p><strong>Company:</strong> ${company || "-"}</p>

                  <p><strong>Budget:</strong> ${budget || "-"}</p>

                  <hr/>

                  <h3>Project Brief</h3>

                  <p>${message.replace(/\n/g, "<br/>")}</p>
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
import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendContactEmail } from "@/lib/ses";
import type { ContactApiResponse } from "@/types";

export const runtime = "nodejs";

function getClientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ContactApiResponse>> {
  const identifier = getClientIdentifier(request);
  const { allowed } = checkRateLimit(identifier);

  if (!allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        message: firstIssue?.message ?? "Please check the form and try again.",
      },
      { status: 422 }
    );
  }

  // Honeypot field populated: silently report success without emailing.
  if (parsed.data.company) {
    return NextResponse.json(
      { success: true, message: "Message sent." },
      { status: 200 }
    );
  }

  try {
    await sendContactEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong sending your message. Please try again.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Message sent — I'll reply within a day." },
    { status: 200 }
  );
}

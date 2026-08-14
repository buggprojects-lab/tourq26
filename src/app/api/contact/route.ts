import { NextRequest, NextResponse } from "next/server";
import { addContactSubmission } from "@/lib/content";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { jsonError } from "@/lib/api-response";
import { MAX_CONTACT_MESSAGE_LENGTH } from "@/lib/constants";

export async function POST(request: NextRequest) {
  if (!(await isFeatureEnabled("marketing_contact_form"))) {
    return jsonError(503, "Contact form is temporarily disabled.");
  }
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const company = typeof body.company === "string" ? body.company.trim() : "";

    if (!name || !email || !message) {
      return jsonError(400, "Name, email, and message are required.");
    }

    if (message.length > MAX_CONTACT_MESSAGE_LENGTH) {
      return jsonError(400, "Message is too long.");
    }

    await addContactSubmission({ name, email, company, message });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact submission error:", e);
    return jsonError(500, "Something went wrong. Please try again or email us at contact@torqstudio.com.");
  }
}

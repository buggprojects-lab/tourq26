import { NextResponse } from "next/server";

/** Standard `{ error }` shape for API route error responses. */
export function jsonError(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

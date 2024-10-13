import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { headers } = request;
  const forwardedFor = headers.get("x-forwarded-for");
  const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

  return NextResponse.json({ ip: clientIp });
}

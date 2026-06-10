import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkDns } from "@/lib/publish/dns";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { host } = body;

  if (!host || typeof host !== "string") {
    return NextResponse.json({ error: "host required" }, { status: 400 });
  }

  try {
    const results = await checkDns(host);
    const allOk = results.every((r) => r.ok);
    return NextResponse.json({ results, allOk });
  } catch (err) {
    return NextResponse.json(
      { error: "DNS check failed. Verify manually or try again in 60s.", results: [] },
      { status: 500 }
    );
  }
}

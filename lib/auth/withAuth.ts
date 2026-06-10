import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

type AuthenticatedHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
  userId: string
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ) => {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, context, session.user.id);
  };
}

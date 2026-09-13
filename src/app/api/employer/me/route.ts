// src/app/api/employer/me/route.ts

import { NextResponse } from "next/server";
import { requireEmployer } from "@/lib/employerAuth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const employer = await requireEmployer();

    if (!employer) {
      return NextResponse.json(
        {
          ok: false,
          error: "Не авторизований",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      employer,
    });
  } catch (error) {
    console.error("[employer.me.error]", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Не авторизований",
      },
      { status: 401 }
    );
  }
}
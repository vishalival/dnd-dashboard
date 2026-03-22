import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/secrets/delete
// Body: { secretId: string }
export async function DELETE(req: NextRequest) {
  try {
    const { secretId } = await req.json();
    if (!secretId) {
      return NextResponse.json(
        { error: "secretId required" },
        { status: 400 },
      );
    }

    // Delete in order to satisfy FK constraints
    await prisma.$transaction([
      prisma.storylineSecret.deleteMany({ where: { secretId } }),
      prisma.sessionSecret.deleteMany({ where: { secretId } }),
      prisma.nPCSecret.deleteMany({ where: { secretId } }),
      prisma.secretGoal.delete({ where: { id: secretId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[secrets/delete]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

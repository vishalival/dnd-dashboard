import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { folderId, title, campaignId } = await request.json();

    if (!title || !campaignId) {
      return NextResponse.json(
        { error: "title and campaignId are required" },
        { status: 400 }
      );
    }

    if (folderId) {
      const folder = await prisma.noteFolder.findUnique({
        where: { id: folderId },
      });

      if (!folder || !folder.allowNewDocs) {
        return NextResponse.json(
          { error: "Cannot add documents to this folder" },
          { status: 403 }
        );
      }
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const docCount = await prisma.noteDocument.count({
      where: folderId ? { folderId } : { campaignId, folderId: null },
    });

    const document = await prisma.noteDocument.create({
      data: {
        title,
        slug: `${slug}-${Date.now()}`,
        campaignId,
        folderId: folderId || null,
        sortOrder: docCount,
        isDeletable: true,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Failed to create note document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

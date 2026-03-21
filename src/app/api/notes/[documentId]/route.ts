import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { content } = await request.json();
    const document = await prisma.noteDocument.update({
      where: { id: params.documentId },
      data: { content },
    });
    return NextResponse.json(document);
  } catch (error) {
    console.error("Failed to update note document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const document = await prisma.noteDocument.findUnique({
      where: { id: params.documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.isDeletable) {
      return NextResponse.json(
        { error: "Cannot delete pre-generated documents" },
        { status: 403 }
      );
    }

    await prisma.noteDocument.delete({
      where: { id: params.documentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete note document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

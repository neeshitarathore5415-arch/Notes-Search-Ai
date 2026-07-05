import prisma from "../config/prisma";

export async function saveDocument(
    title: string,
    filename: string,
    chunks: string[]
) {

    // Store document metadata
    const document = await prisma.document.create({
        data: {
            title,
            filename,
        },
    });


    await prisma.chunk.createMany({
        data: chunks.map((chunk, index) => ({
            content: chunk,
            chunkIndex: index,
            documentId: document.id,
        })),
    });

    return document;

    
}
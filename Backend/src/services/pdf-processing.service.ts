import { extractPdfText } from "./pdf.service";
import { chunkText } from "./chunk.service";
import { generateEmbeddings } from "./embedding.service";

export async function processPdf(filePath: string) {

    // Extract text from uploaded PDF
    const text = await extractPdfText(filePath);

    console.log("========== EXTRACTED TEXT ==========");
    console.log(text.substring(0, 2000));

    // Split extracted text into chunks
    const chunks = chunkText(text);

    console.log("========== FIRST 10 CHUNKS ==========");
    console.log(chunks.slice(0, 10));

    // Generate embeddings
    const embeddings = await generateEmbeddings(chunks);

    console.log("Total Embeddings:", embeddings.length);
    console.log("Vector Size:", embeddings[0].length);

    return {
        text,
        chunks,
        embeddings,
    };
}
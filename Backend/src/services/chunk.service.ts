export function chunkText(text: string): string[] {
    const chunkSize = 800;
    const overlap = 100;

    const chunks: string[] = [];

    for (let i = 0; i < text.length; i += chunkSize - overlap) {
        chunks.push(text.slice(i, i + chunkSize));
    }

    return chunks;
}
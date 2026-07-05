import { writeFile } from "node:fs/promises";
import path from "node:path";

export async function savePdf(file: File) {

    // Convert uploaded file into Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate upload path
    const filePath = path.join(
        process.cwd(),
        "src",
        "uploads",
        file.name
    );

    // Save file to local storage
    await writeFile(filePath, buffer);

    return filePath;

}
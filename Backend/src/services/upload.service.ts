import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function savePdf(file: File) {

    const uploadDir = path.join(process.cwd(), "uploads");

    await mkdir(uploadDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = path.join(uploadDir, file.name);

    await writeFile(filePath, buffer);

    console.log("Saved at:", filePath);

    return filePath;
}
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

interface ProcessedImage {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export async function processAndSaveImage(buffer: Buffer, filename: string): Promise<ProcessedImage> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const timestamp = Date.now();
  const baseName = filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
  const primaryName = `${timestamp}-${baseName}.webp`;
  const thumbName = `${timestamp}-${baseName}-thumb.webp`;

  const primaryBuffer = await sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const metadata = await sharp(primaryBuffer).metadata();

  const thumbBuffer = await sharp(buffer)
    .resize(400, 400, { fit: "cover" })
    .webp({ quality: 75 })
    .toBuffer();

  await Promise.all([
    writeFile(path.join(UPLOAD_DIR, primaryName), primaryBuffer),
    writeFile(path.join(UPLOAD_DIR, thumbName), thumbBuffer),
  ]);

  return {
    url: `/uploads/${primaryName}`,
    thumbnailUrl: `/uploads/${thumbName}`,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

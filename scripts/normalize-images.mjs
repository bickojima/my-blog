import sharp from 'sharp';
import { readdir, stat, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const UPLOADS_DIR = 'public/images/uploads';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const files = await readdir(UPLOADS_DIR).catch(() => []);
const imageFiles = files.filter((f) =>
  IMAGE_EXTENSIONS.includes(extname(f).toLowerCase())
);

let fixed = 0;
for (const file of imageFiles) {
  const filePath = join(UPLOADS_DIR, file);
  const meta = await sharp(filePath).metadata();

  if (meta.orientation && meta.orientation !== 1) {
    const buffer = await sharp(filePath).rotate().toBuffer();
    await writeFile(filePath, buffer);
    const newMeta = await sharp(filePath).metadata();
    console.log(
      `[normalize-images] ${file}: orientation=${meta.orientation} → fixed (${newMeta.width}x${newMeta.height})`
    );
    fixed++;
  }
}

if (fixed > 0) {
  console.log(`[normalize-images] ${fixed} image(s) normalized.`);
}

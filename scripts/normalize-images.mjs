import sharp from 'sharp';
import { readdir, writeFile, lstat } from 'fs/promises';
import { join, extname } from 'path';

const UPLOADS_DIR = 'public/images/uploads';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const PIXEL_LIMIT = 50_000_000; // 50メガピクセル（ピクセルフラッド防御）
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const files = await readdir(UPLOADS_DIR).catch(() => []);
const imageFiles = files.filter((f) =>
  IMAGE_EXTENSIONS.includes(extname(f).toLowerCase())
);

let fixed = 0;
for (const file of imageFiles) {
  const filePath = join(UPLOADS_DIR, file);

  // シンボリックリンク防御
  const fileInfo = await lstat(filePath);
  if (fileInfo.isSymbolicLink()) {
    console.warn(`[normalize-images] Skipping symlink: ${file}`);
    continue;
  }

  // ファイルサイズ上限チェック
  if (fileInfo.size > MAX_FILE_SIZE) {
    console.warn(`[normalize-images] Skipping oversized file: ${file} (${(fileInfo.size / 1024 / 1024).toFixed(1)}MB)`);
    continue;
  }

  const meta = await sharp(filePath, { limitInputPixels: PIXEL_LIMIT }).metadata();

  if (meta.orientation && meta.orientation !== 1) {
    const buffer = await sharp(filePath, { limitInputPixels: PIXEL_LIMIT }).rotate().toBuffer();
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

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

  // シンボリックリンク防御（lstat自体の失敗も考慮: readdir後にファイルが削除された場合など）
  let fileInfo;
  try {
    fileInfo = await lstat(filePath);
  } catch (err) {
    console.warn(`[normalize-images] Failed to stat ${file}:`, err.message);
    continue;
  }
  if (fileInfo.isSymbolicLink()) {
    console.warn(`[normalize-images] Skipping symlink: ${file}`);
    continue;
  }

  // ファイルサイズ上限チェック
  if (fileInfo.size > MAX_FILE_SIZE) {
    console.warn(`[normalize-images] Skipping oversized file: ${file} (${(fileInfo.size / 1024 / 1024).toFixed(1)}MB)`);
    continue;
  }

  // sharp処理全体をtry/catchで保護（SEC-32: 壊れた画像1件でビルド全体を落とさない）
  try {
    const meta = await sharp(filePath, { limitInputPixels: PIXEL_LIMIT }).metadata();

    if (meta.orientation && meta.orientation !== 1) {
      const buffer = await sharp(filePath, { limitInputPixels: PIXEL_LIMIT }).rotate().toBuffer();

      // 回転後バッファのサイズ上限チェック（SEC-32: 出力側にも上限を適用し、安全側に倒して元ファイルを保持）
      if (buffer.length > MAX_FILE_SIZE) {
        console.warn(
          `[normalize-images] Skipping oversized rotated output: ${file} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`
        );
        continue;
      }

      await writeFile(filePath, buffer);
      const newMeta = await sharp(filePath, { limitInputPixels: PIXEL_LIMIT }).metadata();
      console.log(
        `[normalize-images] ${file}: orientation=${meta.orientation} → fixed (${newMeta.width}x${newMeta.height})`
      );
      fixed++;
    }
  } catch (err) {
    console.warn(`[normalize-images] Failed to normalize ${file}:`, err.message);
  }
}

if (fixed > 0) {
  console.log(`[normalize-images] ${fixed} image(s) normalized.`);
}

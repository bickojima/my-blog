import sharp from 'sharp';
import { readdir, stat, writeFile, lstat } from 'fs/promises';
import { join, extname, resolve } from 'path';
import { fileURLToPath } from 'url';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;
const WEBP_QUALITY = 80;
const PIXEL_LIMIT = 50_000_000; // 50メガピクセル（ピクセルフラッド防御）
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function imageOptimize() {
  return {
    name: 'image-optimize',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const distDir = fileURLToPath(dir);
        const uploadsDir = join(distDir, 'images', 'uploads');

        let files;
        try {
          files = await readdir(uploadsDir);
        } catch {
          console.log('[image-optimize] No uploads directory found, skipping.');
          return;
        }

        const imageFiles = files.filter(f =>
          IMAGE_EXTENSIONS.includes(extname(f).toLowerCase())
        );

        if (imageFiles.length === 0) {
          console.log('[image-optimize] No images to optimize.');
          return;
        }

        console.log(`[image-optimize] Optimizing ${imageFiles.length} images...`);

        for (const file of imageFiles) {
          const filePath = join(uploadsDir, file);

          // シンボリックリンク防御
          const fileInfo = await lstat(filePath);
          if (fileInfo.isSymbolicLink()) {
            console.warn(`  [image-optimize] Skipping symlink: ${file}`);
            continue;
          }

          const fileStat = await stat(filePath);
          const originalSize = fileStat.size;

          // ファイルサイズ上限チェック
          if (originalSize > MAX_FILE_SIZE) {
            console.warn(`  [image-optimize] Skipping oversized file: ${file} (${(originalSize / 1024 / 1024).toFixed(1)}MB)`);
            continue;
          }

          try {
            // メタデータ取得とパイプラインを同一インスタンスで処理（ピクセル数制限付き）
            const metadata = await sharp(filePath, { limitInputPixels: PIXEL_LIMIT }).metadata();

            // Apply EXIF orientation (iPhone photos store rotation as EXIF metadata)
            let pipeline = sharp(filePath, { limitInputPixels: PIXEL_LIMIT }).rotate();

            // EXIF orientations 5-8 swap width/height (90°/270° rotations)
            const isRotated = metadata.orientation && metadata.orientation >= 5;
            const effectiveWidth = isRotated ? metadata.height : metadata.width;

            // Resize if wider than MAX_WIDTH
            if (effectiveWidth && effectiveWidth > MAX_WIDTH) {
              pipeline = pipeline.resize(MAX_WIDTH, null, {
                withoutEnlargement: true,
                fit: 'inside',
              });
            }

            // Compress based on format
            const ext = extname(file).toLowerCase();
            if (ext === '.jpg' || ext === '.jpeg') {
              pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
            } else if (ext === '.png') {
              pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 });
            } else if (ext === '.webp') {
              pipeline = pipeline.webp({ quality: WEBP_QUALITY });
            }

            const buffer = await pipeline.toBuffer();
            await writeFile(filePath, buffer);

            const reduction = Math.round((1 - buffer.length / originalSize) * 100);
            const origMB = (originalSize / 1024 / 1024).toFixed(1);
            const newMB = (buffer.length / 1024 / 1024).toFixed(1);
            const displayWidth = effectiveWidth || MAX_WIDTH;
            console.log(
              `  ${file}: ${origMB}MB → ${newMB}MB (-${reduction}%) [${displayWidth}px → ${Math.min(displayWidth, MAX_WIDTH)}px]${isRotated ? ' (EXIF rotated)' : ''}`
            );
          } catch (err) {
            console.warn(`  [image-optimize] Failed to optimize ${file}:`, err.message);
          }
        }

        console.log('[image-optimize] Done.');
      },
    },
  };
}

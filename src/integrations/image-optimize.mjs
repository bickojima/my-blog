import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;
const WEBP_QUALITY = 80;

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
          const fileStat = await stat(filePath);
          const originalSize = fileStat.size;

          try {
            const image = sharp(filePath);
            const metadata = await image.metadata();

            let pipeline = sharp(filePath);

            // Resize if wider than MAX_WIDTH
            if (metadata.width && metadata.width > MAX_WIDTH) {
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
            const { writeFile } = await import('fs/promises');
            await writeFile(filePath, buffer);

            const reduction = Math.round((1 - buffer.length / originalSize) * 100);
            const origMB = (originalSize / 1024 / 1024).toFixed(1);
            const newMB = (buffer.length / 1024 / 1024).toFixed(1);
            console.log(
              `  ${file}: ${origMB}MB → ${newMB}MB (-${reduction}%) [${metadata.width}px → ${Math.min(metadata.width || MAX_WIDTH, MAX_WIDTH)}px]`
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

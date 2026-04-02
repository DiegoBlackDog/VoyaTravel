const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function procesarArchivo(file, maxWidth, quality) {
  if (file.mimetype === 'image/svg+xml') return; // skip SVGs
  const inputPath = file.path;
  const outputPath = inputPath.replace(/\.[^.]+$/, '.webp');
  await sharp(inputPath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
  if (inputPath !== outputPath) fs.unlink(inputPath, () => {});
  file.path = outputPath;
  file.filename = path.basename(outputPath);
  file.mimetype = 'image/webp';
}

/**
 * Middleware that compresses/resizes uploaded image(s) after multer saves them.
 * Handles both req.file (single) and req.files (array).
 * @param {number} maxWidth  - Max width in pixels (default 1400)
 * @param {number} quality   - WebP quality 1-100 (default 82)
 */
function comprimirImagen(maxWidth = 1400, quality = 82) {
  return async (req, res, next) => {
    try {
      if (req.file) {
        await procesarArchivo(req.file, maxWidth, quality);
      } else if (Array.isArray(req.files) && req.files.length > 0) {
        await Promise.all(req.files.map((f) => procesarArchivo(f, maxWidth, quality)));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = comprimirImagen;

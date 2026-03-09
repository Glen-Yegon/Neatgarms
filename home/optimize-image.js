import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = "./chapter";
const outputDir = "./chapter/optimized";

// create output folder
fs.mkdirSync(outputDir, { recursive: true });

fs.readdirSync(inputDir).forEach((file) => {
  if (file.match(/\.(jpg|jpeg|png)$/i)) {

    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);

    sharp(inputPath)
      .resize({
        width: 1400,            // slightly larger width = better quality
        withoutEnlargement: true
      })
      .webp({
        quality: 92,            // higher quality
        effort: 6,              // better compression algorithm
        smartSubsample: true,   // improves detail retention
        nearLossless: true      // keeps more visual quality
      })
      .withMetadata(false)     // remove EXIF metadata (reduces size)
      .toFile(outputPath)

      .then(() => {
        console.log(`✅ Optimized: ${file}`);
      })
      .catch((err) => {
        console.error(`❌ Error optimizing ${file}:`, err);
      });

  }
});
import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = "./future";
const outputDir = "./future/optimized";

// ✅ Automatically create the output folder if missing
fs.mkdirSync(outputDir, { recursive: true });

fs.readdirSync(inputDir).forEach((file) => {
  // Process only image files
  if (file.match(/\.(jpg|jpeg|png)$/i)) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);

    sharp(inputPath)
      .resize({ width: 1050 }) // you can adjust the width
      .webp({ quality: 85 }) // 80% quality gives a good balance
      .toFile(outputPath)
      .then(() => console.log(`✅ Optimized: ${file}`))
      .catch((err) => console.error(`❌ Error optimizing ${file}:`, err));
  }
});

// minify-all.js (ES module version)

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folder = __dirname;

fs.readdir(folder, (err, files) => {
  if (err) {
    console.error('Error reading folder:', err);
    return;
  }

  files.forEach(file => {
    const ext = path.extname(file);
    const base = path.basename(file, ext);

    if (ext === '.css' && !file.endsWith('.min.css')) {
      // Minify CSS
      const input = file;
      const output = `${base}.min.css`;
      exec(`npx cleancss -o "${output}" "${input}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error minifying ${input}:`, stderr);
        } else {
          console.log(`Minified CSS: ${input} -> ${output}`);
        }
      });
    }

    if (ext === '.js' && !file.endsWith('.min.js')) {
      // Minify JS
      const input = file;
      const output = `${base}.min.js`;
      exec(`npx terser "${input}" -o "${output}" --compress --mangle`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error minifying ${input}:`, stderr);
        } else {
          console.log(`Minified JS: ${input} -> ${output}`);
        }
      });
    }
  });
});

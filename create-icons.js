import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createIcons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, 'public/favicon.svg'));
  
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(__dirname, 'public/favicon-16x16.png'));
  
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'public/favicon-32x32.png'));
  
  await sharp(svgBuffer)
    .resize(144, 144)
    .png()
    .toFile(path.join(__dirname, 'public/android-chrome-144x144.png'));
  
  await sharp(svgBuffer)
    .resize(150, 150)
    .png()
    .toFile(path.join(__dirname, 'public/mstile-150x150.png'));
  
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'public/apple-touch-icon.png'));
  
  console.log('Все иконки успешно созданы!');
}

createIcons().catch(console.error); 
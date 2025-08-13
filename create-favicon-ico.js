import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createFaviconIco() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, 'public/favicon.svg'));
  
  const sizes = [16, 32, 48, 64, 128];
  const pngBuffers = await Promise.all(
    sizes.map(size => 
      sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );
  
  try {
    fs.unlinkSync(path.join(__dirname, 'public/favicon.ico'));
    console.log('Старый favicon.ico удален');
  } catch (e) {
  }

  const pngBuffer = pngBuffers[1];
  
  if (pngBuffer) {
    fs.writeFileSync(path.join(__dirname, 'public/favicon.ico'), pngBuffer);
    console.log('favicon.ico успешно создан!');
  } else {
    console.error('Ошибка: не удалось создать PNG-буфер для favicon.ico');
  }
}

createFaviconIco().catch(console.error); 
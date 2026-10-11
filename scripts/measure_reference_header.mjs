import { chromium } from 'playwright';
import path from 'path';

async function measure() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const refPath = 'file:///' + path.resolve('../cmu10_reference.png').replace(/\\/g, '/');
  await page.goto(refPath);
  
  const result = await page.evaluate(() => {
    const imgEl = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Check color down the x = 800 column
    const x = Math.floor(canvas.width / 2);
    let navyEnd = 0;
    for (let y = 0; y < 200; y++) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r > 150 && g > 180 && b > 220) {
        navyEnd = y;
        break;
      }
    }
    return {
      naturalWidth: canvas.width,
      naturalHeight: canvas.height,
      navyEnd
    };
  });
  
  console.log('Reference Image Metrics:', JSON.stringify(result));
  await browser.close();
}

measure().catch(console.error);

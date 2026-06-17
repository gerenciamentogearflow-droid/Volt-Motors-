import * as fs from 'fs';
import * as jpeg from 'jpeg-js';

const img = fs.readFileSync('public/logo.jpg');
const rawImageData = jpeg.decode(img, {useTArray: true});
const data = rawImageData.data;

// top left pixel
const tl_r = data[0];
const tl_g = data[1];
const tl_b = data[2];

// center pixel
const cx = Math.floor(rawImageData.width / 2);
const cy = Math.floor(rawImageData.height / 2);
const centerIdx = (cy * rawImageData.width + cx) * 4;
const c_r = data[centerIdx];
const c_g = data[centerIdx + 1];
const c_b = data[centerIdx + 2];

console.log("Top-Left RGB:", tl_r, tl_g, tl_b);
console.log("Center RGB:", c_r, c_g, c_b);

// Count how many pixels are dark vs light
let dark = 0;
let light = 0;
for (let i=0; i<data.length; i+=4) {
  const l = 0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2];
  if (l < 128) dark++; else light++;
}

console.log("Dark pixels:", dark);
console.log("Light pixels:", light);

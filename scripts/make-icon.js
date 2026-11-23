// Draws assets/icon.png (256x256): indigo rounded square with a white progress ring.
// No dependencies: writes the PNG by hand with zlib.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const S = 256;
const px = Buffer.alloc(S * S * 4);

function set(x, y, r, g, b, a) {
  const i = (y * S + x) * 4;
  px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a;
}

const R = 56; // corner radius
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const cx = Math.min(Math.max(x, R), S - 1 - R);
    const cy = Math.min(Math.max(y, R), S - 1 - R);
    const inSquare = Math.hypot(x - cx, y - cy) <= R;
    if (!inSquare) { set(x, y, 0, 0, 0, 0); continue; }
    // vertical gradient indigo
    const t = y / S;
    let r = Math.round(99 - 20 * t), g = Math.round(102 - 32 * t), b = Math.round(241 - 12 * t);
    // ring
    const dx = x - 128, dy = y - 128, d = Math.hypot(dx, dy);
    const ang = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI); // 0 at top, clockwise
    if (d >= 62 && d <= 84) {
      if (ang <= Math.PI * 1.5) { r = 255; g = 255; b = 255; }
      else { r = Math.round(r * 0.75 + 255 * 0.25); g = Math.round(g * 0.75 + 255 * 0.25); b = Math.round(b * 0.75 + 255 * 0.25); }
    }
    // centre dot
    if (d <= 22) { r = 255; g = 255; b = 255; }
    set(x, y, r, g, b, 255);
  }
}

const raw = Buffer.alloc((S * 4 + 1) * S);
for (let y = 0; y < S; y++) {
  raw[y * (S * 4 + 1)] = 0;
  px.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, '..', 'assets', 'icon.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png);
console.log('wrote', out);

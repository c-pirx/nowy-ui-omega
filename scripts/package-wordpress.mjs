import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pluginName = 'omega-mg-redesign';
const output = join(root, 'dist');
const stage = join(output, pluginName);
const required = ['index.html', 'styles.css', 'app.js', 'calculator.js'];

for (const file of required) await stat(join(root, 'public', file));
const app = await readFile(join(root, 'public/app.js'), 'utf8');
if (!/import\s+[\s\S]*?['"]\.\/calculator\.js['"]/.test(app)) {
  throw new Error('public/app.js must import ./calculator.js; WordPress enqueues app.js as the sole entry module.');
}
const html = await readFile(join(root, 'public/index.html'), 'utf8');
if (!/<body\b[^>]*>[\s\S]*<\/body>/i.test(html)) throw new Error('Missing complete HTML body.');
if (/OmegaKalkData\s*=/.test(html)) throw new Error('Do not embed a captured WordPress nonce in public/index.html.');
const css = await readFile(join(root, 'public/styles.css'), 'utf8');
if (/url\(\s*['"]?\/assets\//i.test(css)) {
  throw new Error('CSS asset URLs must be relative (assets/...) so fonts/images resolve inside the WordPress plugin.');
}

// Clear only this script's verified output folder so removed assets cannot enter a later ZIP.
if (relative(root, output) !== 'dist' || relative(output, stage) !== pluginName) {
  throw new Error('Refusing to clean an output folder outside this workspace.');
}
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });
for (const file of ['omega-mg-redesign.php', 'template.php']) {
  await cp(join(root, 'wordpress', file), join(stage, file));
}
await cp(join(root, 'public'), join(stage, 'public'), { recursive: true });
const calculator = await readFile(join(root, 'public/calculator.js'));
const calculatorVersion = createHash('sha256').update(calculator).digest('hex').slice(0, 12);
await writeFile(join(stage, 'public/app.js'), app.replace(/(['"])\.\/calculator\.js\1/, `$1./calculator.js?v=${calculatorVersion}$1`));
await cp(join(root, 'research/wordpress-notes.md'), join(stage, 'README.md'));

// A small standards-compliant ZIP writer keeps packaging dependency-free on Windows.
const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
async function collect(directory, prefix = '') {
  const files = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await collect(join(directory, entry.name), relative));
    else if (entry.isFile()) files.push({ path: relative, data: await readFile(join(directory, entry.name)) });
  }
  return files;
}
const files = await collect(stage);
const locals = [];
const central = [];
let offset = 0;
for (const file of files) {
  const name = Buffer.from(`${pluginName}/${file.path}`, 'utf8');
  const compressed = deflateRawSync(file.data, { level: 9 });
  const crc = crc32(file.data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(0x0021, 12); // 1980-01-01: reproducible archive timestamps.
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(file.data.length, 22);
  local.writeUInt16LE(name.length, 26);
  locals.push(local, name, compressed);
  const directory = Buffer.alloc(46);
  directory.writeUInt32LE(0x02014b50, 0);
  directory.writeUInt16LE(20, 4);
  directory.writeUInt16LE(20, 6);
  directory.writeUInt16LE(0x0800, 8);
  directory.writeUInt16LE(8, 10);
  directory.writeUInt16LE(0x0021, 14);
  directory.writeUInt32LE(crc, 16);
  directory.writeUInt32LE(compressed.length, 20);
  directory.writeUInt32LE(file.data.length, 24);
  directory.writeUInt16LE(name.length, 28);
  directory.writeUInt32LE(offset, 42);
  central.push(directory, name);
  offset += local.length + name.length + compressed.length;
}
const centralDirectory = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralDirectory.length, 12);
end.writeUInt32LE(offset, 16);
const archive = Buffer.concat([...locals, centralDirectory, end]);
const zipPath = join(output, `${pluginName}.zip`);
await writeFile(zipPath, archive);
console.log(`WordPress package: ${zipPath} (${files.length} files, ${(archive.length / 1024 / 1024).toFixed(2)} MB)`);

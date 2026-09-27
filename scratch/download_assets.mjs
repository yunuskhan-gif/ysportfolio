import fs from "fs";
import path from "path";

const assetsToDownload = [
  { url: "https://yscapital.com/assets/ys_vertical_logo-D4ri0SwB.png", name: "ys_vertical_logo.png" },
  { url: "https://yscapital.com/assets/serene-sunset-with-stones-background-light-DyxxGsBz.png", name: "hero_serene_sunset.png" },
  { url: "https://yscapital.com/assets/amfi-logo-tDajMlJa.png", name: "amfi_logo.png" },
  { url: "https://yscapital.com/assets/apmi-logo-BnmVeNLL.png", name: "apmi_logo.png" },
  { url: "https://yscapital.com/assets/digital-access-devices-bgtransparent-B7jKmMwS.png", name: "digital_devices.png" }
];

async function download() {
  const publicDir = path.resolve("./public");
  for (const item of assetsToDownload) {
    try {
      console.log(`Downloading ${item.url}...`);
      const res = await fetch(item.url);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        fs.writeFileSync(path.join(publicDir, item.name), Buffer.from(buffer));
        console.log(`Saved ${item.name} (${buffer.byteLength} bytes)`);
      } else {
        console.error(`Failed ${item.name}: ${res.status}`);
      }
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err);
    }
  }
}

download();

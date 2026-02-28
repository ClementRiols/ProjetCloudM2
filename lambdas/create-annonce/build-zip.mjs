import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// On est dans lambdas/create-annonce
const cwd = process.cwd();
const zipName = "create-annonce.zip";
const zipPath = path.join(cwd, zipName);

// 1) Clean old zip
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

// 2) Ensure deps installed (node_modules exists)
if (!fs.existsSync(path.join(cwd, "node_modules"))) {
  console.log("node_modules manquant -> npm install");
  execSync("npm install", { stdio: "inherit" });
}

// 3) Build zip (IMPORTANT: zip root must contain index.js directly)
console.log("Building zip:", zipPath);

// zip command: -r recursive, -q quiet optional
// We add files WITHOUT the folder prefix.
execSync(`zip -r ${zipName} index.js package.json node_modules`, { stdio: "inherit" });

console.log(`OK: ${zipName} généré ✅`);
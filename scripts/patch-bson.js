import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bsonDir = path.join(__dirname, "..", "node_modules", "bson");

if (fs.existsSync(bsonDir)) {
  const filesToPatch = [
    path.join(bsonDir, "lib", "bson.mjs"),
    path.join(bsonDir, "lib", "bson.node.mjs"),
    path.join(bsonDir, "lib", "bson.bundle.js"),
    path.join(bsonDir, "lib", "bson.cjs"),
  ];

  filesToPatch.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");
      if (content.includes("this.resetState();")) {
        content = content.replace("this.resetState();", "this.resetState?.();");
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`[patch-bson] Successfully patched ${path.relative(process.cwd(), filePath)}`);
      }
    }
  });
}

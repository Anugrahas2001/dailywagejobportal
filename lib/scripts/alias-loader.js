// scripts/alias-loader.js
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const projectRoot = process.cwd();
const extensions = [".js", ".mjs", ".jsx", ".ts", ".tsx"];

function resolveWithExtensions(absolutePath) {
  // Exact file exists already (has extension or is a real file)
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) {
    return absolutePath;
  }
  // Try appending extensions
  for (const ext of extensions) {
    const withExt = absolutePath + ext;
    if (fs.existsSync(withExt)) return withExt;
  }
  // Try as a directory with an index file
  for (const ext of extensions) {
    const indexFile = path.join(absolutePath, "index" + ext);
    if (fs.existsSync(indexFile)) return indexFile;
  }
  return null; // couldn't resolve, let Node throw its normal error
}

export async function resolve(specifier, context, nextResolve) {
  // Handle "@/..." alias
  if (specifier.startsWith("@/")) {
    const relativePath = specifier.slice(2);
    const absolutePath = path.join(projectRoot, relativePath);
    const resolved = resolveWithExtensions(absolutePath);
    if (resolved) {
      return nextResolve(pathToFileURL(resolved).href, context);
    }
  }

  // Handle relative imports missing extensions ("../foo", "./bar")
  if (specifier.startsWith(".") && context.parentURL) {
    const parentPath = new URL(context.parentURL).pathname;
    const parentDir = path.dirname(decodeURIComponent(
      process.platform === "win32" ? parentPath.slice(1) : parentPath
    ));
    const absolutePath = path.join(parentDir, specifier);
    const resolved = resolveWithExtensions(absolutePath);
    if (resolved) {
      return nextResolve(pathToFileURL(resolved).href, context);
    }
  }

  return nextResolve(specifier, context);
}
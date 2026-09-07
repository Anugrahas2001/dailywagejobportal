// // scripts/register-loader.js
// import { register } from "node:module";
// import { pathToFileURL } from "node:url";

// register("./alias-loader.js", pathToFileURL(import.meta.url));

// scripts/register-loader.js
import { register } from "node:module";

register("./alias-loader.js", import.meta.url);
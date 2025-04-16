import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Components actually used in the project
const usedComponents = [
  "button",
  "card",
  "checkbox",
  "input",
  "label",
  "progress",
  "scroll-area",
  "select",
  "switch",
  "tabs",
  "toast",
  "badge",
  "alert",
];

// Path to the UI components directory
const uiDir = path.join(__dirname, "..", "components", "ui");

// Get all component files
const allComponentFiles = fs.readdirSync(uiDir);

// Filter out used components
const unusedComponentFiles = allComponentFiles.filter((file) => {
  const baseName = path.basename(file, path.extname(file));
  return !usedComponents.includes(baseName) && baseName !== "use-toast";
});

console.log("Unused UI components:");
unusedComponentFiles.forEach((file) => {
  console.log(`- ${file}`);
  // Uncomment the line below to actually delete the files
  // fs.unlinkSync(path.join(uiDir, file));
});

console.log(
  "\nTo remove these files, run this script again with the delete flag:"
);
console.log("node scripts/clean-ui-components.js --delete");

// If --delete flag is provided, delete the unused components
if (process.argv.includes("--delete")) {
  unusedComponentFiles.forEach((file) => {
    fs.unlinkSync(path.join(uiDir, file));
    console.log(`Deleted: ${file}`);
  });
  console.log("Unused components have been deleted.");
}

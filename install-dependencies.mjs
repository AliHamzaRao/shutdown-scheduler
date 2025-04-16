import { execSync } from "child_process";
import fs from "fs";

console.log("Installing missing Radix UI dependencies...");

try {
  // Read the package.json file
  const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

  // Extract all @radix-ui dependencies
  const radixDependencies = Object.keys(packageJson.dependencies)
    .filter((dep) => dep.startsWith("@radix-ui/"))
    .join(" ");

  console.log(`Installing: ${radixDependencies}`);

  // Install all Radix UI dependencies
  execSync(`npm install ${radixDependencies}`, { stdio: "inherit" });

  console.log("All dependencies installed successfully!");
} catch (error) {
  console.error("Error installing dependencies:", error);
}

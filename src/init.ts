import { getJsonFile, putJsonFile } from "@mongez/fs";
import chalk from "chalk";
import { execSync } from "child_process";
import { cwd } from "process";

const huskyInit =
  'npx husky-init && npx husky set .husky/pre-commit "npx huskier --staged"';

execSync(huskyInit, { stdio: "inherit" });

// now add `huskier` key to package.json
const packageJson = getJsonFile(cwd() + "/package.json");

if (!packageJson.huskier) {
  packageJson.huskier = {
    hooks: {
      "pre-commit": [],
    },
  };
  console.log(
    `Added ${chalk.yellow("huskier")} key to ${chalk.yellow(`package.json`)}`
  );
  // save the file
  putJsonFile(cwd() + "/package.json", packageJson);
} else {
  console.log(
    `The ${chalk.yellow("huskier")} key already exists in ${chalk.yellow(
      `package.json`
    )}`
  );
}

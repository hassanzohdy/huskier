import { getJsonFile, putJsonFile } from "@mongez/fs";
import {colors} from "@mongez/copper";
import { execSync } from "child_process";
import { cwd } from "process";

const huskyInit =
  'npx husky-init && npx husky set .husky/pre-commit "npx huskier --staged --color"';

execSync(huskyInit, { stdio: "inherit" });

// now add `huskier` key to package.json
const packageJson = getJsonFile(cwd() + "/package.json");

if (!packageJson.huskier) {
  packageJson.huskier = {
    hooks: {
      "pre-commit": [],
    },
    parallel: true,
  };
  console.log(
    `Added ${colors.yellow("huskier")} key to ${colors.yellow(`package.json`)}`
  );
  // save the file
  putJsonFile(cwd() + "/package.json", packageJson);
} else {
  console.log(
    `The ${colors.yellow("huskier")} key already exists in ${colors.yellow(
      `package.json`
    )}`
  );
}

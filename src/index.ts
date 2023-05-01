import { getJsonFile } from "@mongez/fs";
import chalk from "chalk";
import { cwd } from "process";
import { executePreCommit } from "./hooks/pre-commit";

const packageJson = getJsonFile(cwd() + "/package.json");

// get from the package key called "huskier"
const huskier = packageJson.huskier;

if (!huskier) {
  console.log(chalk.red("huskier key ") + "is missing from package.json");
  process.exit(1);
}

// it should be an object, containing `hooks`, for now the hooks contains only `pre-commit`
if (!huskier.hooks) {
  console.log(chalk.red("huskier.hooks ") + "is missing from package.json");
  process.exit(1);
}

// now check if the --staged flag is passed
const staged = process.argv.includes("--staged");

// if staged is passed, we should only execute the commands that are under the `pre-commit` key
if (staged) {
  // check first if the pre-commit key exists
  if (!huskier.hooks["pre-commit"]) {
    console.log(
      chalk.red("huskier.hooks.pre-commit ") + "is missing from package.json"
    );
    process.exit(1);
  }

  executePreCommit(huskier.hooks["pre-commit"]);
}

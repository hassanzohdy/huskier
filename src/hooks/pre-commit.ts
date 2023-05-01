#!/usr/bin/env node

import chalk from "chalk";
import { execSync } from "child_process";

export function executePreCommit(commands: string[]) {
  // now loop over the huskier array and execute each command
  // we should print [STARTED] command, [STARTED] in yellow color and command in white color
  // if success, we should print [SUCCESS] command, [SUCCESS] in green color and command in white color
  // if failed, we should print [FAILED] command, [FAILED] in red color and command in white color, then stop executing the rest of commands.
  // we also need to track the execution time of each command and print it in the end
  // we should also print the total execution time of all commands
  // we should also print the total number of commands executed

  let totalExecuted = {
    commands: 0,
    time: 0,
    success: 0,
    failed: 0,
  };

  for (let index = 0; index < commands.length; index++) {
    const command = commands[index];
    // execute the command
    // print [STARTED] command
    console.log(
      chalk.yellow("[STARTED]") +
        " " +
        `(${index + 1}/${commands.length}) ` +
        chalk.whiteBright.bold(command)
    );
    const time = Date.now();
    try {
      // execute the command using execSync and print the output as well
      execSync(command, { stdio: "inherit" });
      // increment the total number of commands executed
      totalExecuted.commands++;
      // increment the total number of success commands
      totalExecuted.success++;
      // increment the total execution time of all commands
      totalExecuted.time += Date.now() - time;
      // print [SUCCESS] command
      console.log(
        chalk.green("[SUCCESS]") +
          " " +
          `(${index + 1}/${commands.length}) ` +
          chalk.whiteBright.bold(command) +
          " " +
          chalk.gray(`(${Date.now() - time}ms)`)
      );
    } catch (error) {
      // increment the total number of commands executed
      totalExecuted.commands++;
      // increment the total number of failed commands
      totalExecuted.failed++;
      // increment the total execution time of all commands
      totalExecuted.time += Date.now() - time;
      // print [FAILED] command
      console.log(
        chalk.red("[FAILED]") +
          " " +
          `(${index + 1}/${commands.length}) ` +
          chalk.whiteBright.bold(command) +
          " " +
          chalk.gray(`(${Date.now() - time}ms)`)
      );
      // stop executing the rest of commands
      break;
    }
  }

  // total commands
  console.log(
    chalk.whiteBright("Total commands: ") + chalk.cyan(commands.length)
  );

  // print the total number of commands executed
  console.log(
    chalk.whiteBright("Total executed commands: ") +
      chalk.yellow(totalExecuted.commands)
  );

  // print the total execution time of all commands
  console.log(
    chalk.whiteBright("Total execution time: ") +
      chalk.yellow(totalExecuted.time + "ms")
  );

  if (totalExecuted.success > 0) {
    // print the total number of success commands
    console.log(
      chalk.whiteBright("Total success commands: ") +
        chalk.green(totalExecuted.success)
    );
  }

  if (totalExecuted.failed > 0) {
    // print the total number of failed commands
    console.log(
      chalk.whiteBright("Total failed commands: ") +
        chalk.red(totalExecuted.failed)
    );
  }

  // now exit the process
  process.exit(totalExecuted.failed > 0 ? 1 : 0);
}

#!/usr/bin/env node

import { colors } from "@mongez/copper";
import { exec as execCb, execSync } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

interface ExecutedInfo {
  commands: number;
  success: number;
  failed: number;
  time: number;
}

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
      colors.yellow("[STARTED]") +
        " " +
        `(${index + 1}/${commands.length}) ` +
        colors.whiteBright(command)
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
        colors.green("[SUCCESS]") +
          " " +
          `(${index + 1}/${commands.length}) ` +
          colors.whiteBright(command) +
          " " +
          colors.gray(`(${Date.now() - time}ms)`)
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
        colors.red("[FAILED]") +
          " " +
          `(${index + 1}/${commands.length}) ` +
          colors.whiteBright(command) +
          " " +
          colors.gray(`(${Date.now() - time}ms)`)
      );
      // stop executing the rest of commands
      break;
    }
  }

  // total commands
  console.log(
    colors.whiteBright("Total commands: ") + colors.cyan(commands.length)
  );

  // print the total number of commands executed
  console.log(
    colors.whiteBright("Total executed commands: ") +
      colors.yellow(totalExecuted.commands)
  );

  // print the total execution time of all commands
  console.log(
    colors.whiteBright("Total execution time: ") +
      colors.yellow(totalExecuted.time + "ms")
  );

  if (totalExecuted.success > 0) {
    // print the total number of success commands
    console.log(
      colors.whiteBright("Total success commands: ") +
        colors.green(totalExecuted.success)
    );
  }

  if (totalExecuted.failed > 0) {
    // print the total number of failed commands
    console.log(
      colors.whiteBright("Total failed commands: ") +
        colors.red(totalExecuted.failed)
    );
  }

  // now exit the process
  process.exit(totalExecuted.failed > 0 ? 1 : 0);
}

export async function executePreCommitInParallel(commands: string[]) {
  let totalExecuted: ExecutedInfo = {
    commands: 0,
    success: 0,
    failed: 0,
    time: 0,
  };

  const promises = commands.map(async (command, index) => {
    console.log(
      colors.yellow("[STARTED]") +
        " " +
        `(${index + 1}/${commands.length}) ` +
        colors.whiteBright(command)
    );
    const time = Date.now();
    try {
      const { stdout, stderr } = await exec(command);
      console.log(stdout);
      console.error(stderr);
      totalExecuted.commands++;
      totalExecuted.success++;
      totalExecuted.time += Date.now() - time;
      console.log(
        colors.green("[SUCCESS]") +
          " " +
          `(${index + 1}/${commands.length}) ` +
          colors.whiteBright(command) +
          " " +
          colors.gray(`(${Date.now() - time}ms)`)
      );
    } catch (error) {
      totalExecuted.commands++;
      totalExecuted.failed++;
      totalExecuted.time += Date.now() - time;
      console.log(
        colors.red("[FAILED]") +
          " " +
          `(${index + 1}/${commands.length}) ` +
          colors.whiteBright(command) +
          " " +
          colors.gray(`(${Date.now() - time}ms)`)
      );
    }
  });

  await Promise.allSettled(promises);
  console.log(totalExecuted); // print total statistics when all commands have finished
}

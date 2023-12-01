#!/usr/bin/env node
import { colors } from "@mongez/copper";
import { execSync, spawn } from "child_process";

interface ExecutedInfo {
  commands: number;
  success: number;
  failed: number;
  time: number;
}

export async function executePreCommitInParallel(commands: string[]) {
  let totalExecuted: ExecutedInfo = {
    commands: 0,
    success: 0,
    failed: 0,
    time: 0,
  };

  const commandPromises = commands.map((command, index) => {
    return new Promise((resolve) => {
      console.log(
        colors.yellow("[STARTED]") +
          " " +
          `(${index + 1}/${commands.length}) ` +
          colors.whiteBright(command)
      );
      const time = Date.now();

      const child = spawn(command, {
        shell: true,
        stdio: [process.stdin, process.stdout, process.stderr],
      });

      child.on("exit", (code: number) => {
        totalExecuted.commands++;
        totalExecuted.time += Date.now() - time;
        if (code === 0) {
          totalExecuted.success++;
          console.log(
            colors.green("[SUCCESS]") +
              " " +
              `(${index + 1}/${commands.length}) ` +
              colors.whiteBright(command) +
              " " +
              colors.gray(`(${Date.now() - time}ms)`)
          );
          resolve(null);
        } else {
          totalExecuted.failed++;
          console.log(
            colors.red("[FAILED]") +
              " " +
              `(${index + 1}/${commands.length}) ` +
              colors.whiteBright(command) +
              " " +
              colors.gray(`(${Date.now() - time}ms)`)
          );
          resolve(null);
        }
      });
    });
  });

  await Promise.allSettled(commandPromises);

  if (totalExecuted.failed === 0) {
    console.log(
      colors.green("[SUCCESS]") +
        " " +
        colors.whiteBright("All commands executed successfully")
    );
  } else {
    console.log(
      colors.red("[FAILED]") +
        " " +
        `[${totalExecuted.failed}/${totalExecuted.commands}] commands failed`
    );
  }

  // now exit the process
  process.exit(totalExecuted.failed > 0 ? 1 : 0);
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

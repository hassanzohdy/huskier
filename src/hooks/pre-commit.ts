#!/usr/bin/env node
import { colors } from "@mongez/copper";
import { execSync, spawn } from "child_process";
import { log, intro, outro, spinner } from "@clack/prompts";

interface ExecutedInfo {
  commands: number;
  success: number;
  failed: number;
  time: number;
}

interface CommandResult {
  command: string;
  index: number;
  status: string;
  output: string;
}

export async function executePreCommitInParallel(
  commands: string[]
): Promise<CommandResult[]> {
  let totalExecuted: ExecutedInfo = {
    commands: 0,
    success: 0,
    failed: 0,
    time: 0,
  };

  const commandResults: CommandResult[] = [];

  intro("Executing pre-commit hooks in parallel...");

  const commandPromises = commands.map((command, index) => {
    return new Promise((resolve) => {
      log.info(
        colors.yellow("[STARTED]") +
          " " +
          `(${index + 1}/${commands.length}) ` +
          colors.whiteBright(command)
      );
      const time = Date.now();
      let stdout = "";
      let stderr = "";

      const child = spawn(command, {
        shell: true,
        env: { ...process.env, FORCE_COLOR: true },
      } as any);

      child.stdout.on("data", (data) => {
        stdout += data;
      });

      child.stderr.on("data", (data) => {
        stderr += data;
      });

      child.on("exit", (code: number) => {
        totalExecuted.commands++;
        totalExecuted.time += Date.now() - time;
        if (code === 0) {
          totalExecuted.success++;
          commandResults.push({
            command: command,
            index: index,
            status: "Success",
            output: stdout,
          });
          resolve(null);
        } else {
          totalExecuted.failed++;
          commandResults.push({
            command: command,
            index: index,
            status: "Failed",
            output: stderr,
          });
          resolve(null);
        }
      });
    });
  });

  await Promise.all(commandPromises);

  for (let i = 0; i < commandResults.length; i++) {
    const result = commandResults[i];
    if (result.status === "Failed") {
      log.error(
        colors.red("[FAILED]") +
          " " +
          `(${result.index + 1}/${commands.length}) ` +
          colors.whiteBright(result.command) +
          " " +
          colors.gray(`(${result.output})`)
      );
    } else {
      log.success(
        colors.green("[SUCCESS]") +
          " " +
          `(${result.index + 1}/${commands.length}) ` +
          colors.whiteBright(result.command)
      );
    }
  }

  const result =
    totalExecuted.failed > 0
      ? colors.redBright(
          `${totalExecuted.failed}/${totalExecuted.commands} commands failed`
        )
      : colors.greenBright(
          `${totalExecuted.success}/${totalExecuted.commands} commands succeeded`
        );

  outro(
    `Completed execution of ${result} in ${colors.yellow(
      totalExecuted.time + "ms"
    )}`
  );

  // now exit the process
  process.exit(totalExecuted.failed > 0 ? 1 : 0);
}

export async function executePreCommit(commands: string[]) {
  // now loop over the huskier array and execute each command
  // we should print [STARTED] command, [STARTED] in yellow color and command in white color
  // if success, we should print [SUCCESS] command, [SUCCESS] in green color and command in white color
  // if failed, we should print [FAILED] command, [FAILED] in red color and command in white color, then stop executing the rest of commands.
  // we also need to track the execution time of each command and print it in the end
  // we should also print the total execution time of all commands
  // we should also print the total number of commands executed
  intro("Started executing pre-commit hooks...");

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
    const loader = spinner();
    loader.start(
      colors.yellow("[STARTED]") +
        " " +
        `(${index + 1}/${commands.length}) ` +
        colors.whiteBright(command)
    );

    const time = Date.now();
    try {
      // execute the command using execSync and print the output as well
      execSync(command, {});

      // increment the total number of commands executed
      totalExecuted.commands++;
      // increment the total number of success commands
      totalExecuted.success++;
      // increment the total execution time of all commands
      totalExecuted.time += Date.now() - time;
      // print [SUCCESS] command
      loader.stop(
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
      loader.stop(
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

  const result =
    totalExecuted.failed > 0
      ? colors.redBright(
          `${totalExecuted.failed}/${totalExecuted.commands} commands failed`
        )
      : colors.greenBright(
          `${totalExecuted.success}/${totalExecuted.commands} commands succeeded`
        );

  outro(
    `Completed execution of ${result} in ${colors.yellow(
      totalExecuted.time + "ms"
    )}`
  );

  // now exit the process
  process.exit(totalExecuted.failed > 0 ? 1 : 0);
}

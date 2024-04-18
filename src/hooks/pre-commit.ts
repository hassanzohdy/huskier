import { intro, log } from "@clack/prompts";
import { colors } from "@mongez/copper";
import { spawn } from "child_process";

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
  output?: { stdout: string; stderr: string };
  totalSubCommands?: number;
  subIndex?: number;
  timeTaken: number;
}

type CommandType = string | string[];

async function executeCommand({
  command,
  totalExecuted,
  index,
  commandResults,
  totalCommands,
  subIndex,
  totalSubCommands,
}: {
  command: string;
  totalExecuted: ExecutedInfo;
  index: number;
  commandResults: CommandResult[];
  totalCommands: number;
  subIndex?: number;
  totalSubCommands?: number;
}) {
  return new Promise((resolve) => {
    if (totalSubCommands && subIndex !== undefined) {
      log.info(
        colors.yellow("[STARTED]") +
          " " +
          `(${index + 1}/${totalCommands}) ` +
          colors.gray(` (${subIndex + 1}/${totalSubCommands}) `) +
          colors.whiteBright(command)
      );
    } else {
      log.info(
        colors.yellow("[STARTED]") +
          " " +
          `(${index + 1}/${totalCommands}) ` +
          colors.whiteBright(command)
      );
    }
    const time = Date.now();

    const child = spawn(command, [], {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, FORCE_COLOR: true } as any,
    });

    child?.stdout.on("data", (data) => {
      process.stdout.write(
        colors.whiteBright(`[${command}] `) + data.toString()
      );
    });

    child?.stderr.on("data", (data) => {
      process.stderr.write(colors.red(`[${command}] `) + data.toString());
    });

    child?.on("exit", (code) => {
      totalExecuted.commands++;
      const timeTaken = Date.now() - time;
      totalExecuted.time += timeTaken;

      if (code === 0) {
        totalExecuted.success++;

        commandResults.push({
          command: command,
          index: index,
          status: "Success",
          subIndex: subIndex,
          totalSubCommands: totalSubCommands,
          timeTaken,
        });

        resolve(true);
      } else if (code === 1) {
        if (totalSubCommands && subIndex !== undefined) {
          console.log(
            colors.red("[FAILED]") +
              " " +
              `(${index + 1}/${totalCommands}) ` +
              colors.whiteBright(command) +
              colors.gray(` (${subIndex + 1}/${totalSubCommands}) `) +
              colors.gray(`(${seconds(timeTaken)})`)
          );
        } else {
          console.log(
            colors.red("[FAILED]") +
              " " +
              `(${index + 1}/${totalCommands}) ` +
              colors.whiteBright(command) +
              " " +
              colors.gray(`(${seconds(timeTaken)})`)
          );
        }

        process.exit(1);
      }
    });
  });
}

export async function executeCommandsInParallel(commands: CommandType[]) {
  const { commandResults, totalExecuted } = initCommandsCalling();

  const commandPromises = commands.map(async (command, index) => {
    if (Array.isArray(command)) {
      // if the command is an array, it means it must be executed in sequence
      for (let idx = 0; idx < command.length; idx++) {
        const cmd = command[idx];

        await executeCommand({
          command: cmd,
          commandResults,
          index: index,
          totalCommands: commands.length,
          subIndex: idx,
          totalSubCommands: command.length,
          totalExecuted,
        });
      }

      return;
    }

    return await executeCommand({
      command,
      commandResults,
      index,
      totalCommands: commands.length,
      totalExecuted,
    });
  });

  await Promise.all(commandPromises);

  displayCommandsResults(commands, commandResults);
}

export async function executeCommandsInSequence(commands: CommandType[]) {
  // now loop over the huskier array and execute each command
  // we should print [STARTED] command, [STARTED] in yellow color and command in white color
  // if success, we should print [SUCCESS] command, [SUCCESS] in green color and command in white color
  // if failed, we should print [FAILED] command, [FAILED] in red color and command in white color, then stop executing the rest of commands.
  // we also need to track the execution time of each command and print it in the end
  // we should also print the total execution time of all commands
  // we should also print the total number of commands executed

  const { commandResults, totalExecuted } = initCommandsCalling();

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];

    if (Array.isArray(command)) {
      // if the command is an array, it means it must be executed in sequence
      for (let idx = 0; idx < command.length; idx++) {
        const cmd = command[idx];

        await executeCommand({
          command: cmd,
          commandResults,
          index: i,
          totalCommands: commands.length,
          subIndex: idx,
          totalSubCommands: command.length,
          totalExecuted,
        });
      }

      continue;
    }

    await executeCommand({
      command,
      commandResults,
      index: i,
      totalCommands: commands.length,
      totalExecuted,
    });
  }

  displayCommandsResults(commands, commandResults);
}

function seconds(timeInMs: number) {
  // we need to round it to the nearest second with 2 decimal points

  return Number(timeInMs / 1000).toFixed(2) + "s";
}

function initCommandsCalling() {
  const totalExecuted: ExecutedInfo = {
    commands: 0,
    success: 0,
    failed: 0,
    time: 0,
  };

  const commandResults: CommandResult[] = [];

  intro("Executing pre-commit hooks in parallel...");

  return { totalExecuted, commandResults };
}

function displayCommandsResults(
  commands: CommandType[],
  commandResults: CommandResult[]
) {
  // make sure to sort the commandResults by the index
  commandResults.sort((a, b) => a.index - b.index);

  for (let i = 0; i < commandResults.length; i++) {
    const result = commandResults[i];

    if (result.totalSubCommands && result.subIndex !== undefined) {
      log.success(
        colors.green("[SUCCESS]") +
          " " +
          `(${result.index + 1}/${commands.length}) ` +
          colors.whiteBright(result.command) +
          colors.gray(` (${result.subIndex + 1}/${result.totalSubCommands}) `) +
          ` ${colors.yellow(`(${seconds(result.timeTaken)})`)}`
      );
    } else {
      log.success(
        colors.green("[SUCCESS]") +
          " " +
          `(${result.index + 1}/${commands.length}) ` +
          colors.whiteBright(result.command) +
          ` ${colors.yellow(`(${seconds(result.timeTaken)})`)}`
      );
    }
  }
}

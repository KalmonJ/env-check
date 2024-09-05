#!/usr/bin/env node
import { join } from "path";
import chalk from "chalk";
import figlet from "figlet";
import fs from "fs";
import { Command } from "./command.mjs";
type PrimaryCommands = "--init" | "--help";

// TODO: add --debug or -d options for debug
// TODO: add all command for search all .env files

const command = new Command();

command
  .register({ type: "option", value: "--init" })
  .register({
    type: "argument",
    value: "all",
    ref: "--init",
    action: function () {
      console.log("say hello");
    },
  })
  .register({
    type: "option",
    value: "-p",
    ref: "all",
    action: function () {
      console.log("say hello to all");
    },
  })
  .validate(...["--init", "all"]);

console.log(command.inspect("all"));

export const parseCommands = (args: string[]) => {
  const commands = args.slice(2);

  if (!commands.length) return;

  resolveCommands(...commands);
};

const resolveCommands = async (...commands: string[]) => {
  const pathRgx =
    /^([a-zA-Z]:\\|\/)?([a-zA-Z0-9_\-\/\\\.\s]+)(\/|\\)?(\.env)?$/gi;
  const [primary, secondary] = commands;

  try {
    console.log(
      chalk.yellowBright(
        figlet.textSync("ENV-CHECK", { horizontalLayout: "full" }),
      ),
    );
    console.log("\n");

    switch (primary as PrimaryCommands) {
      case "--init":
        if (!secondary) {
          resolveHelpCommand();
          resolveEnvs();
          break;
        }

        if (secondary === "all") {
          resolveEnvs();
          break;
        }

        if (!pathRgx.test(secondary)) {
          throwAnError("Error: Invalid path format.");
          break;
        }

        resolveEnvsFromPath(secondary);
        console.log(
          chalk.greenBright("Success: all environment variables are present"),
        );
        break;

      case "--help":
        resolveHelpCommand();
        break;

      default:
        throwAnError("Unknown command, please use --help.");
        break;
    }
  } catch (error) {
    throwAnError("No such file or directory");
  }
};

const resolveHelpCommand = () => {
  console.log("usage: env-check [options] [command]");
  console.log("\n");
  console.log("Options:");
  console.log(
    "   --init",
    " ".repeat(36),
    "Automatically find env files in our project",
  );
  console.log(
    "   --init <env_file_path>",
    " ".repeat(20),
    "Get env files based on given path",
  );
  console.log("\n");
  console.log("commands:");
  console.log(
    "   env-check --init",
    " ".repeat(26),
    "Automatically find env files in our project",
  );
  console.log(
    "   env-check --init <env_file_path>",
    " ".repeat(10),
    "Get env files based on given path",
  );
  console.log("\n");
};

const resolveEnvsFromPath = (path: string) => {
  const absoluteEnvPath = join(process.cwd(), path);
  const result = fs.readFileSync(absoluteEnvPath, {
    encoding: "utf-8",
  });

  validateEnvs(result, "env"); // TODO: replace this hard coded name
};

const resolveEnvs = () => {
  const directories = fs.readdirSync("./", {
    recursive: true,
    withFileTypes: true,
    encoding: "utf-8",
  });

  const envFiles = directories.filter(
    (diretory) =>
      diretory.isFile() &&
      diretory.name.includes(".env") &&
      diretory.name !== ".env.example",
  );

  if (!envFiles.length) {
    throwAnError("No envs found");
  }

  envFiles.forEach((file) => {
    const relativePath = join(file.path || file.parentPath, file.name);
    const result = fs.readFileSync(relativePath, {
      encoding: "utf-8",
    });

    validateEnvs(result, file.name);
  });
};

const throwAnError = (message: string) => {
  console.log(chalk.redBright(`Error: ${message}`));
  process.exit(1);
};

const validateEnvs = (input: string, fileName: string) => {
  const lineBreakersRgx = /[\n\r]/g;
  const envRgx = /(.+)=("?.+"?)/gi;
  const envs = input.trim().split(lineBreakersRgx).filter(Boolean);

  if (!envs.length) {
    throwAnError(`No envs found in ${fileName} file`);
  }

  envs.forEach((env) => {
    const res = envRgx.exec(env);
    envRgx.lastIndex = 0;

    if (!res) return;

    const name = res[1];
    const value = JSON.parse(res[2].trim());

    if (!value) {
      throwAnError(`Env: ${name} is empty`);
    }
  });
};

parseCommands(process.argv);

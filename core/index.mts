#!/usr/bin/env node
import { join } from "path"
import chalk from "chalk"
import figlet from "figlet"
import fs from "fs"

type PrimaryCommands = "--init" | "--help"

export const parseCommands = (args: string[]) => {
  const commands = args.slice(2)
  resolveCommands(...commands)
}


const resolveCommands = async (...commands: string[]) => {
  const pathRgx = /^([a-zA-Z]:\\|\/)?([a-zA-Z0-9_\-\/\\\.\s]+)(\/|\\)?(\.env)?$/g
  const [primary, path] = commands

  try {
    console.log(chalk.yellowBright(figlet.textSync("ENV-CHECK", { horizontalLayout: "full" })))
    console.log("\n")

    switch (primary as PrimaryCommands) {
      case "--init":
        if (!path) {
          resolveHelpCommand()
          // find automatically path
          return
        }
        if (!pathRgx.test(path)) {
          console.log(chalk.redBright("Error: Invalid path format."))
          return
        }
        getEnvsFromPath(path)
        return

      case "--help":
        resolveHelpCommand()
        return

      default:
        console.log(chalk.redBright("Error: Unknown command, please use --help."))
        return
    }
  } catch (error) {
    console.log(chalk.redBright("Error: No such file or directory."))
    process.exit(1)
  }
}

const resolveHelpCommand = () => {
  console.log("usage: env-check [options] [command]")
  console.log("\n")
  console.log("Options:")
  console.log("   --init", " ".repeat(36), "Automatically find env files in our project")
  console.log("   --init <env_file_path>", " ".repeat(20), "Get env files based on given path")
  console.log("\n")
  console.log("commands:")
  console.log("   env-check --init", " ".repeat(26), "Automatically find env files in our project")
  console.log("   env-check --init <env_file_path>", " ".repeat(10), "Get env files based on given path")
  console.log("\n")
}

const getEnvsFromPath = (path: string) => {
  const lineBreakersRgx = /[\n\r]/g
  const absoluteEnvPath = join(process.cwd(), path)

  const result = fs.readFileSync(absoluteEnvPath, {
    encoding: "utf-8"
  })

  const envs = result.trim().split(lineBreakersRgx).filter(Boolean)

  if (!envs.length) {
    console.log(chalk.redBright("Error: No envs found"))
    return process.exit(1)
  }

  validateEnvs(envs)
}

const validateEnvs = (envs: string[]) => {
  const envRgx = /(.+)=("?.+"?)/gi

  envs.forEach(env => {
    const res = envRgx.exec(env)
    envRgx.lastIndex = 0

    if (!res) return

    const name = res[1]
    const value = JSON.parse(res[2].trim())

    if (!value) {
      console.log(chalk.redBright(`Env: ${name} is empty`))
      process.exit(1)
    }
  })
}

parseCommands(process.argv)

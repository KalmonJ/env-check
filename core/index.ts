#!/usr/bin/env node

import { join } from "path"
import fs from "fs"

export const parseCommands = (args: string[]) => {
  const commands = args.slice(2)

  const isValidCommands = validateCommands(...commands)
  if (!isValidCommands) throw new Error("Invalid commands")

  resolveCommands(...commands)
}

const validateCommands = (...commands: string[]) => {

  const pathRgx = /^([a-zA-Z]:\\|\/)?([a-zA-Z0-9_\-\/\\\.\s]+)(\/|\\)?(\.env)?$/g

  if (commands.length > 2) {
    console.error(`Error: Unknown command ${commands[commands.length - 1]} use --help.`)
    return false
  }

  const [command, path] = commands

  if (path && !pathRgx.test(commands[1])) {
    console.error("Error: Invalid path provided.Check the format and try again.")
    return false
  }

  if (command !== "--init") {
    console.error("Error: Invalid commands use --help.")
    return false
  }

  return true
}

const resolveCommands = async (...commands: string[]) => {
  const path = commands[1]
  const lineBreakersRgx = /[\n\r]/g
  const envValueRgx = /="(.+)"|=(.+)/gim
  const absoluteEnvPath = join(__dirname, "../../", path)

  try {
    const result = fs.readFileSync(absoluteEnvPath, {
      encoding: "utf-8"
    })

    const envs = result.trim().split(lineBreakersRgx).filter(Boolean)

    if (!envs.length) {
      console.log("Error: No envs found")
      process.exit(1)
    }

    envs.forEach(env => {
      const value = envValueRgx.exec(env)

      if (!value) return

      const envValue = value[1] || value[2]

      envValueRgx.lastIndex = 0

      console.log(envValue)
    })

  } catch (error) {
    console.log("Error: No such file or directory.")
    process.exit(1)
  }
}

parseCommands(process.argv)

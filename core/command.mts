type CommandType = "option" | "argument"

export class CommandNode {
  type: CommandType
  value: string
  action: Function | null = null
  childrens: Map<string, CommandNode> = new Map()

  constructor(type: CommandType, value: string) {
    this.type = type
    this.value = value
  }

}

class Command {
  root: Map<string, CommandNode> = new Map()

  register(type: CommandType, value: string, optionRef: string | null = null) {
    const command = new CommandNode(type, value)

    if (!this.root.size || !optionRef) {
      this.root.set(this.commandToCode(command.value), command)
      return this
    }

    this.root.forEach(list => {
      this.registerCommand(list, type, value, optionRef)
    })

    return this
  }

  private registerCommand(node: CommandNode, type: CommandType, value: string, optionRef: string | null = null) {
    const command = new CommandNode(type, value)

    if (optionRef && node.value === optionRef) {
      node.childrens.set(this.commandToCode(value), command)

      return
    } else {

      if (!node.childrens.size && optionRef) throw new Error(`not found ref ${optionRef}`)

      node.childrens.forEach(childNode => {
        this.registerCommand(childNode, type, value, optionRef)
      })
    }
  }

  validate(...commands: string[]) {
    if (!this.root.size) throw new Error("no commands registered", {
      cause: "VALIDATION_ERROR"
    })


    for (const command of commands) {
      const rootCommand = this.root.get(this.commandToCode(command))
      if (!rootCommand) throw new Error("invalid command or sequence")
      this.recursiveValidation(rootCommand, command)
    }
  }


  private recursiveValidation(node: CommandNode, command: string) {
    if (node.value !== command) throw new Error("invalid command or sequence", {
      cause: "VALIDATION_ERROR"
    })

    if (!node.childrens.size) {
      return
    }

    if (node.value !== command) throw new Error("invalid command or sequence")
  }

  private commandToCode(command: string) {
    let hash = 0

    for (let i = 0; i < command.length; i++) {
      const charCode = command.charCodeAt(i)
      hash = ((hash << 5) - hash) + charCode
    }

    return hash.toString()
  }
}

export const command = new Command()





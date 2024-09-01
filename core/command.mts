
// registrar, validar e executar
// os comandos de entrada deve seguir apartir do root o comando que não seguir


type CommandType = "option" | "argument"


export class CommandNode {
  type: CommandType
  action: Function
  value: string
  next: CommandNode | null = null

  constructor(type: CommandType, value: string) {
    this.type = type
    this.value = value
  }

  exec() {
    this.action()
  }
}

class Command {
  head: Map<string, CommandNode> = new Map()

  register(type: CommandType, value: string, optionRef: string | null = null) {
    const command = new CommandNode(type, value)

    if (!this.head.size || !optionRef) {
      console.log(value, "valor")
      this.head.set(this.commandToCode(command.value), command)
      return this
    }
    const codeRef = this.commandToCode(optionRef)
    let commandNodeRef = this.head.get(codeRef)

    if (!commandNodeRef) throw new Error(`Error not found option ${optionRef}`)
    commandNodeRef = this.registerCommand(commandNodeRef, type, value)
    this.head.set(optionRef, commandNodeRef)

    return this
  }

  private registerCommand(node: CommandNode, type: CommandType, value: string) {
    if (!node.next) {
      node.next = new CommandNode(type, value)
      return node
    }

    node = this.registerCommand(node.next, type, type)
    return node
  }

  validate(...commands: string[]) {
    console.log(commands, "comandoos")
  }


  private commandToCode(command: string) {
    let hash = 0

    for (let i = 0; i < command.length; i++) {
      const charCode = command.charCodeAt(i)
      hash = ((hash << 5) - hash) + charCode
    }

    return hash.toString()
  }

  action(cb: Function) {
    cb()
  }

}

export const command = new Command()





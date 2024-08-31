
// registrar, validar e executar
// os comandos de entrada deve seguir apartir do root o comando que não seguir


type CommandType = "option" | "command"


export class CommandNode {
  type: CommandType
  action: Function
  value: string
  childrens: Map<unknown, CommandNode> = new Map()

  constructor(type: CommandType, value: string) {
    this.type = type
    this.value = value
  }

  exec() {
    this.action()
  }
}

class Command {
  root: Map<string, CommandNode> = new Map()

  // TODO: melhorar inserção, adicionar alguma forma de direcionar o commando

  register(type: CommandType, value: string) {
    const code = this.commandToCode(value)
    const command = new CommandNode(type, value)

    if (!this.root.get(value)) {
      this.root.set(code, command)
      return this
    }

    return this
  }

  // TODO: adicionar validação recursiva, validar o comando com base na raiz

  validate(...commands: string[]) {
    for (const command of commands) {
      const code = this.commandToCode(command)
      const value = this.root.get(code)
      if (!value) throw new Error(`Error: command not found`)
    }
  }

  recursiveValidate(commandNode: CommandNode, command: string) {
    if (commandNode.value === command) {
      return
    }


    commandNode.childrens.forEach((node, key) => {

    })

  }

  exec() {

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





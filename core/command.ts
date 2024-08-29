

class CommandNode {
  command: string
  left: null | CommandNode
  right: null | CommandNode

  constructor(command: string) {
    this.command = command
    this.right = null
    this.left = null
  }
}

class Command {
  root: CommandNode | null = null

  private addCommand(node: CommandNode | null, command: string) {
    if (!node) {
      console.log("caiu aquii")
      node = new CommandNode(command)
      return
    }

    console.log("aqui hello world", node)

    this.addCommand(node.left, command)
    this.addCommand(node.right, command)
  }

  add(command: string) {
    if (!this.root) {
      this.root = new CommandNode(command)
    }
    this.addCommand(this.root, command)
  }
}

export const command = new Command()



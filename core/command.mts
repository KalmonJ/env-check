type CommandType = "option" | "argument";

type Maybe<T> = T | undefined;

type RegisterConfig = {
  type: CommandType;
  value: string;
  ref?: Maybe<string>;
  action?: Maybe<Function>;
};

type registerCommandProps = RegisterConfig & {
  node: CommandNode;
};

export class CommandNode {
  type: CommandType;
  value: string;
  action: Function | undefined;
  childrens: Map<string, CommandNode> = new Map();

  constructor(type: CommandType, value: string, action: Function | undefined) {
    this.type = type;
    this.value = value;
    this.action = action;
  }
}

export class Command {
  root: Map<string, CommandNode> = new Map();
  private currentRoot?: CommandNode;

  register(config: RegisterConfig) {
    const command = new CommandNode(config.type, config.value, config.action);

    if (!this.root.size || !config.ref) {
      this.root.set(this.commandToCode(command.value), command);
      return this;
    }

    this.root.forEach((node) => {
      this.registerCommand({ ...config, node });
    });

    return this;
  }

  private registerCommand(props: registerCommandProps) {
    const command = new CommandNode(props.type, props.value, props.action);

    if (props.ref && props.node.value === props.ref) {
      props.node.childrens.set(this.commandToCode(props.value), command);

      return;
    } else {
      if (!props.node.childrens.size && props.ref)
        throw new Error(`not found ref ${props.ref}`);

      props.node.childrens.forEach((childNode) => {
        this.registerCommand({ ...props, node: childNode });
      });
    }
  }

  validate(...commands: string[]) {
    if (!this.root.size)
      throw new Error("no commands registered", {
        cause: "VALIDATION_ERROR",
      });

    const rootCommand = this.commandToCode(commands[0]);

    const rootNode = this.root.get(rootCommand);

    for (const command of commands) {
      if (!rootNode) throw new Error(`invalid root command ${rootCommand}`);
      const isValidCommand = this.recursiveValidation(rootNode, command, false);
      if (!isValidCommand) throw new Error(`invalid command ${command}`);
    }

    this.currentRoot = rootNode;

    return this;
  }

  // execute() {
  //   if (!this.currentRoot) throw new Error("No currentRoot found");
  //   this.recursiveExecution(this.currentRoot);
  // }

  // private recursiveExecution(node: CommandNode) {
  //   // if(node)
  // }

  inspect(command: string): CommandNode | null {
    let value: CommandNode | null = null;

    this.root.forEach((node) => {
      const v = this.findNode(node, command);
      console.log(v);
    });

    return value;
  }

  private findNode(
    node: CommandNode,
    command: string,
    findNode: CommandNode | undefined = undefined,
  ) {
    if (!node.childrens.size) {
      findNode = undefined;
      return findNode;
    }

    if (node.value === command) {
      findNode = node;
      return findNode;
    }

    node.childrens.forEach((childNode) => {
      findNode = this.findNode(childNode, command, findNode);
    });

    return findNode;
  }

  private recursiveValidation(
    node: CommandNode,
    command: string,
    equal: boolean,
  ) {
    if (node.value === command) {
      equal = true;
      return equal;
    }

    node.childrens.forEach((childNode) => {
      equal = this.recursiveValidation(childNode, command, equal);
    });

    return equal;
  }

  private commandToCode(command: string) {
    let hash = 0;

    for (let i = 0; i < command.length; i++) {
      const charCode = command.charCodeAt(i);
      hash = (hash << 5) - hash + charCode;
    }

    return hash.toString();
  }
}

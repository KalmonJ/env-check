type CommandType = "option" | "argument";

type Maybe<T> = T | undefined;

type RegisterConfig = {
  type: CommandType;
  value: string;
  optionRef?: Maybe<string>;
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

  register(config: RegisterConfig) {
    const command = new CommandNode(config.type, config.value, config.action);

    if (!this.root.size || !config.optionRef) {
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

    if (props.optionRef && props.node.value === props.optionRef) {
      props.node.childrens.set(this.commandToCode(props.value), command);

      return;
    } else {
      if (!props.node.childrens.size && props.optionRef)
        throw new Error(`not found ref ${props.optionRef}`);

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
    console.log(rootNode);

    for (const command of commands) {
      if (!rootNode) throw new Error(`invalid root command ${rootCommand}`);
      const isValidCommand = this.recursiveValidation(rootNode, command, false);
      if (!isValidCommand) throw new Error(`invalid command ${command}`);
    }
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

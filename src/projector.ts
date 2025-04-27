
import State from "./state"
import Signal from "./signal"
import { Builder } from "./ctx"
import { h, VNode, } from "./snabbdom"
//import Ctx from "./ctx"

const EMPTY_BUILDER = () => h("!");

/* Exposed constructors */
export function projector<A extends any[]>(initialBuilder: (...args: A) => VNode = EMPTY_BUILDER, ...initialArgs: A): Projector {
  return Projector.create(initialBuilder, initialArgs);
}
export function anchor<A extends any[]>(initialBuilder: (...args: A) => VNode = EMPTY_BUILDER, ...initialArgs: A): Anchor {
  return Anchor.create(initialBuilder, initialArgs);
}
export function stack<A extends any[] = []>(initialBuilder?: (...args: A) => VNode, ...initialArgs: A): Stack {
  return Stack.create(initialBuilder, initialArgs);
}

/*export class Shards {
  
  
  
  
}
export class Stack {
  
  readonly contexts: Ctx[];
  
  push<A extends any[]>(builder: (...args: A) => VNode, ...builderArgs: A) {
    if (builderArgs.length === 0) {
      this.update.emit(builder);
    } else {
      this.update.emit(() => builder(...builderArgs));
    }
  }
}*/



export class Projector {
  
  readonly update = new Signal<[Builder]>();
  readonly initial: Builder;
  
  private constructor(initialBuilder: Builder) {
    this.initial = initialBuilder;
  }
  static create<A extends any[]>(initialBuilder: (...args: A) => VNode, initialArgs: A): Projector {
    if (initialArgs.length === 0) {
      return new Projector(initialBuilder);
    } else {
      return new Projector(() => initialBuilder(...initialArgs));
    }
  }
  
  put<A extends any[]>(builder: (...args: A) => VNode, ...builderArgs: A) {
    if (builderArgs.length === 0) {
      this.update.emit(builder);
    } else {
      this.update.emit(() => builder(...builderArgs));
    }
  }
  clear() {
    this.update.emit(EMPTY_BUILDER);
  }
  reset() {
    this.update.emit(this.initial);
  }
}

export type BundledBuilder<A extends any[]> = [Builder<A>, A];
export class Anchor {
  readonly state: State<Builder>;
  
  constructor(initialBuilder: Builder) {
    this.state = new State(initialBuilder);
  }
  static create<A extends any[]>(initialBuilder: (...args: A) => VNode, initialArgs: A): Anchor {
    if (initialArgs.length === 0) {
      return new Anchor(initialBuilder);
    } else {
      return new Anchor(() => initialBuilder(...initialArgs));
    }
  }
  
  put<A extends any[]>(builder: (...args: A) => VNode, ...builderArgs: A) {
    if (builderArgs.length === 0) {
      this.state.set(builder);
    } else {
      this.state.set(() => builder(...builderArgs));
    }
  }
  clear() {
    this.state.set(EMPTY_BUILDER);
  }
}

export class Stack {
  readonly update = new Signal<[Builder | undefined]>();
  builders: Builder[] = [];
  
  static create<A extends any[] = []>(initialBuilder: undefined | Builder<A>, initialArgs: A) {
    const stack = new Stack();
    if (initialBuilder) stack.add(initialBuilder, initialArgs);
    return stack;
  }
  private notify() {
    this.update.emit(this.builders.at(-1));
  }
  private add<A extends any[]>(builder: Builder<A>, builderArgs: A) {
    if (builderArgs.length === 0) {
      this.builders.push(builder);
    } else {
      this.builders.push(() => builder(...builderArgs));
    }
  }
  
  get count() {
    return this.builders.length;
  }
  top(): Builder | undefined {
    return this.builders.at(-1);
  }
  root(): Builder | undefined {
    return this.builders.at(0);
  }
  push<A extends any[]>(builder: Builder<A>, ...builderArgs: A) {
    this.add(builder, builderArgs);
    this.notify();
  }
  splice<A extends any[]>(builder: Builder<A>, ...builderArgs: A) {
    this.builders.pop();
    this.add(builder, builderArgs);
    this.notify();
  }
  pop() {
    if (this.builders.length > 0) {
      this.builders.pop();
      this.notify();
    }
  }
  clear<A extends any[] = []>(initialBuilder?: Builder<A>, ...initialArgs: A) {
    if (this.builders.length > 0) {
      this.builders = [];
    }
    if (initialBuilder) {
      this.add(initialBuilder, initialArgs);
    }
    this.notify();
  }
  
}



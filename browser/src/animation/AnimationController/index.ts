import {AnimationModule, ContinuousAnimationModule, DiscreteAnimationModule} from "../types";

export class AnimationController {
  #discreteModules: Record<string, DiscreteAnimationModule>;
  #continuousModules: Record<string, ContinuousAnimationModule>;

  constructor() {
    this.#discreteModules = {};
    this.#continuousModules = {};
  }

  addModule(moduleName: string, module: AnimationModule) {
    if(module.type === 'continuous') {
      this.#continuousModules[moduleName] = module;
    }

    if(module.type === 'discrete') {
      this.#discreteModules[moduleName] = module;
    }
  }

  update(moduleName: string, dt: number) {
    this.#continuousModules[moduleName]?.update(dt);
  }

  start(moduleName: string) {
    this.#discreteModules[moduleName]?.start();
  }
}

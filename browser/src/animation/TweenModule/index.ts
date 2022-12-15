import {Tween, Easing} from "@tweenjs/tween.js";
import { DiscreteAnimationModule } from "../types";

export interface AnimationObject {
  value: number;
}

export class TweenModule implements DiscreteAnimationModule{
  readonly type = 'discrete';

  #animationObject: AnimationObject;
  #tween: Tween<AnimationObject>;

  constructor(from: number, to: number,durationInMs: number) {
    this.#animationObject = { value: from };
    this.#tween = new Tween(this.#animationObject)
      .to({value: to}, durationInMs)
      .easing(Easing.Quadratic.Out);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUpdateTarget(targetObject: Record<any, any>, propertyName: string) {
    this.#tween.onUpdate(() => {
      targetObject[propertyName] = this.#animationObject.value
    })
  }

  start() {
    this.#tween.start();
  }
}

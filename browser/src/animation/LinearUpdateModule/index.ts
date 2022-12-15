import {ContinuousAnimationModule} from "../types";

export class LinearUpdateModule implements ContinuousAnimationModule {
  readonly type = 'continuous';

  #animationValue: number;
  #updatePerSecond: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #targetObject: Record<any, any> | undefined;
  #targetProperty: string | undefined;

  constructor(initialValue: number, updatePerSecond = 1) {
    this.#animationValue = initialValue;
    this.#updatePerSecond = updatePerSecond;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setUpdateTarget(targetObject: Record<any, any>, propertyName: string) {
    this.#targetObject = targetObject;
    this.#targetProperty = propertyName;
  }

  update(dt: number): void {
    this.#animationValue += dt * this.#updatePerSecond;

    // console.log(this.#targetProperty, this.#targetObject, this.#targetObject?.[this.#targetProperty]);
    // NOTE: Boundary check ma be a bottleneck in large sets
    if(this.#targetProperty && this.#targetObject) {
      this.#targetObject[this.#targetProperty] = this.#animationValue;
    }
  }
}

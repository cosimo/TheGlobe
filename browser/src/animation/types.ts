export interface ContinuousAnimationModule {
  type: 'continuous';
  update: (dt: number) => void;
  setUpdateTarget: (targetObject: Record<string, number>, propertyName: string) => void;
}

export interface DiscreteAnimationModule {
  type: 'discrete';
  start: () => void;
  setUpdateTarget: (targetObject: Record<string, number>, propertyName: string) => void;
}

export type AnimationModule = DiscreteAnimationModule | ContinuousAnimationModule;

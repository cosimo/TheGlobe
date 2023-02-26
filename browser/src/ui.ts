import * as THREE from 'three';
import {getData, getMetrics} from './data';
import { stats, gui } from "./debug";
import {Visual} from './visual';
import {loadIssTrajectoryData} from './ephemeris';

import {Tween, Easing, update as tweenUpdate} from '@tweenjs/tween.js';


const metric1Element = document.querySelector('#metric1_value');
const metric2Element = document.querySelector('#metric2_value');
const renderRootElement = document.querySelector('#vis') as HTMLDivElement;

const metric1Value = {value: 0};
const metric2Value = {value: 0};

const duration = 60_000;

export function updateUI({metric1, metric2}: { metric1: [number, number], metric2: [number, number] }) {
  if (metric1) {
    new Tween(metric1Value)
      .to({value: metric1[1]}, duration)
      .easing(Easing.Linear.None)
      .onUpdate(() => {
        if(metric1Element) {
          metric1Element.innerHTML = String(Math.round(metric1Value.value));
        }
      })
      .start();
  }

  if (metric2) {
    new Tween(metric2Value)
      .to({value: metric2[1]}, duration)
      .easing(Easing.Linear.None)
      .onUpdate(() => {
        if(metric2Element) {
          metric2Element.innerHTML = String(Math.round(metric2Value.value));
        }
      })
      .start();
  }
}

const clock = new THREE.Clock();
const visual = new Visual(renderRootElement);
visual.start();

const settings = { clockSpeed: 1.0 };
const clockFolder = gui.addFolder("Clock");

clockFolder.add(settings, "clockSpeed")
           .min(-10000.0)
           .max(10000.0)
           .step(1)
           .onChange((value: number) => { settings.clockSpeed = value });

function update() {
  requestAnimationFrame((time) => {
    const dt = clock.getDelta() * settings.clockSpeed;
    tweenUpdate(time);
    visual.update(dt);
    stats.update();
    update();
  });
}

loadIssTrajectoryData();
update();

export function updateEarth() {
  getMetrics().then(metrics => updateUI(metrics));
  getData().then(({hits}) => visual.setDataPoints(hits));
  visual.updateBodiesPositions();
}

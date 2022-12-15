import * as THREE from 'three';
import {Tween, Easing} from "@tweenjs/tween.js";
import { getSunMoonPositions, getUTCDatetime } from "./astrodynamics";
import { gui } from './debug';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {Lensflare, LensflareElement} from "three/examples/jsm/objects/Lensflare";
import {
    GodRaysEffect,
    EffectComposer,
    EffectPass,
    RenderPass,
    KernelSize,
    BlendFunction,
    BloomEffect,
    // @ts-ignore
} from "postprocessing";

import { Earth } from "./bodies/earth";
import { Stars } from "./bodies/stars";
import { Sun } from "./bodies/sun";

import {Controller} from "lil-gui";
import { PointLight } from 'three';


function normalize(min: number, max: number, minBorder: number, maxBorder: number) {
  return function (val: number) {
    return (((maxBorder - minBorder) * (val - min)) / (max - min)) + minBorder;
  };
}

const statsFolder = gui.addFolder('Stats');
const memoryFolder = statsFolder.addFolder('Memory');
const renderFolder = statsFolder.addFolder('Render');

let sunMoonPositions;

let texturesDebug: Controller;
let geometriesDebug: Controller;

let trianglesDebug: Controller;
let pointsDebug: Controller;
let linesDebug: Controller;

const timeSettings = {
  useRealtime: true,
  fixedDatetime: "20260812.1832",
  autoRotate: true,
  autoRotateSpeed: 0.75,
};

const timeFolder = gui.addFolder("Time");

export class Visual {
  #scene: THREE.Scene;
  #renderer: THREE.WebGLRenderer;
  #camera: THREE.PerspectiveCamera;
  #controls: OrbitControls;
  #rootElement: HTMLElement;
  #lightsGroup: THREE.Object3D;
  #sun: Sun;
  #composer: EffectComposer;

  #earth: Earth | undefined;
  #dataPoints: [number, number, number, number][] | undefined;
  #pointLight: PointLight;

  public constructor(root: HTMLElement) {
    this.#rootElement = root;
    this.#scene = new THREE.Scene();

    this.#renderer = this.initRenderer();
    this.#camera = this.initCamera();
    this.#controls = this.initControls();
    this.#composer = new EffectComposer(this.#renderer);

    this.#sun = new Sun();
    this.#pointLight = this.initPointlight();
    this.#lightsGroup = this.initLightsGroup();

    this.setupScene();
    this.setupEventListeners();

    texturesDebug = memoryFolder.add(this.#renderer.info.memory, 'textures').disable(true);
    geometriesDebug = memoryFolder.add(this.#renderer.info.memory, 'geometries').disable(true);

    trianglesDebug = renderFolder.add(this.#renderer.info.render, 'triangles').disable(true);
    pointsDebug = renderFolder.add(this.#renderer.info.render, 'lines').disable(true);
    linesDebug = renderFolder.add(this.#renderer.info.render, 'points').disable(true);

    timeFolder.add(timeSettings, "useRealtime")
              .onChange((value: boolean) => {
                  timeSettings.useRealtime = value;
                  this.updateBodiesPositions();
              });
    timeFolder.add(timeSettings, "fixedDatetime")
              .onChange((value: string) => {
                  timeSettings.fixedDatetime = value;
                  this.updateBodiesPositions();
              });
    timeFolder.add(timeSettings, "autoRotate")
              .onChange((value: boolean) => {
                  timeSettings.autoRotate = value;
                  this.#controls.autoRotate = value;
              });
    timeFolder.add(timeSettings, "autoRotateSpeed")
              .onChange((value: number) => {
                  timeSettings.autoRotateSpeed = value;
                  this.#controls.autoRotateSpeed = value;
              });
  }

  public start() {
    const animationObject = {
      zoom: this.#camera.zoom,
    }

    new Tween(animationObject)
      .to({ zoom: 1 }, 5000)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        this.#camera.zoom = animationObject.zoom;
        this.#camera.updateProjectionMatrix();
      })
      .start();
  }

  public setDataPoints(dataPoints: [number, number, number][]) {
    this.#dataPoints = this.transformDataPoints(dataPoints);
    this.#earth?.replaceDataPointList(this.#dataPoints);
  }

  public update(dt: number) {
    this.updateScene(dt);
    this.#controls.update();
    this.render();

    // Sun bloom, godrays, etc... effects
    this.#composer?.render(dt);

    texturesDebug.updateDisplay();
    geometriesDebug.updateDisplay();

    trianglesDebug.updateDisplay();
    pointsDebug.updateDisplay();
    linesDebug.updateDisplay();
  }

  public updateBodiesPositions() {
    let now: number = parseFloat(timeSettings.fixedDatetime);
    if (timeSettings.useRealtime) {
      now = getUTCDatetime();
    }

    sunMoonPositions = getSunMoonPositions(now);
    const pos = sunMoonPositions;

    this.#lightsGroup.position.set(pos.sun.x, pos.sun.y, pos.sun.z);
    this.#lightsGroup.lookAt(new THREE.Vector3(0, 0, 0));

    this.#earth?.getMoonMesh().position.set(pos.moon.x, pos.moon.y, pos.moon.z);
    this.#earth?.rotateForTime(now);

    // Moon rotation is tidally locked with Earth with a period of 27.233 days
    // Here's an attempt to determine the correct moon Y-axis rotation based
    // on the J2000 days and such a 27.233 period.
    const moonPeriod = 27.233;
    const moonY = ((pos.eqc.daynumber % moonPeriod) / moonPeriod * (2 * Math.PI)) - 4.0;

    // Totally pulled out of thin air, this needs proper calculation.
    // Trying to understand this better
    const moonZ = -0.25;

    this.#earth?.getMoonMesh().rotation.set(0, moonY, moonZ);
  }

  private initRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    return renderer;
  }

  private initCamera() {
    const fov = 50;
    const near = 0.1;
    const aspect = window.innerWidth / window.innerHeight;
    const far = 400.0;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.y = 1.75;
    camera.position.z = 2.0;
    camera.zoom = 0.01;

    return camera;
  }

  private initControls() {
    const controls = new OrbitControls(this.#camera, this.#renderer.domElement);
    controls.autoRotate = timeSettings.autoRotate;
    controls.autoRotateSpeed = timeSettings.autoRotateSpeed;

    return controls;
  }

  private initPointlight() {
    const pointLight = new THREE.PointLight(0xffffff, 0.9);
    pointLight.castShadow = true;
    return pointLight;
  }

  private render() {
    this.#renderer.render(this.#scene, this.#camera);
  }

  private initLightsGroup() {
    const ambientLight = new THREE.AmbientLight(0x232323, 0.025);
    const lightsGroup = new THREE.Group();

    lightsGroup.add(ambientLight);

    return lightsGroup;
  }

  private setupScene() {
    this.#scene.add(this.#camera);

    this.#earth = new Earth();
    this.#scene.add(this.#earth.getMesh());

    const stars = new Stars();
    this.#scene.add(stars.getMesh());

    this.#lightsGroup.add(this.#pointLight);
    this.#lightsGroup.add(this.#sun.getMesh());

    this.updateBodiesPositions();

    this.#scene.add(this.#lightsGroup);

    this.#rootElement.appendChild(this.#renderer.domElement);
    this.addEffects();
  }

  // These sun effects are taken from the fantastic project
  // at https://github.com/hizzd/threejs-earth-sun/
  private addEffects() {
    const bloomEffect = new BloomEffect({
      blendFunction: BlendFunction.SCREEN,
      kernelSize: KernelSize.MEDIUM,
      resolutionScale: 0.5,
      //distinction: 3.8
    });

    bloomEffect.blendMode.opacity.value = 2.5;

    let godraysEffect = new GodRaysEffect(this.#camera, this.#sun.getMesh(), {
      resolutionScale: 0.75,
      kernelSize: KernelSize.SMALL,
      density: 0.96,
      decay: 0.95,
      weight: 0.3,
      exposure: 0.55,
      samples: 60,
      clampMax: 1.0,
      blendFunction: BlendFunction.SCREEN
    });
    godraysEffect.dithering = true;

    const effectPass = new EffectPass(this.#camera, bloomEffect, godraysEffect);
    effectPass.renderToScreen = true;

    this.#composer.addPass(new RenderPass(this.#scene, this.#camera));
    this.#composer.addPass(effectPass);

    const flareColor = new THREE.Color(0xffffff);
    flareColor.setHSL(0.55, 0.9, 1.0);
    const lensFlare = new Lensflare();
    const flareTexture1 = new THREE.TextureLoader().load("textures/flare1.jpg");
    lensFlare.addElement(new LensflareElement(flareTexture1, 480, 0, flareColor));
    this.#pointLight.add(lensFlare);
  }

  private clampDataPoints(dataPoints: [number, number, number][]) {
    const clampedSet: [number, number, number][] = [];
    for(const [lat, lon, hits] of dataPoints) {
      const clampedLat = Math.round(lat * 10) / 10;
      const clampedLon = Math.round(lon * 10) / 10;

      const oldHitIndex = clampedSet.findIndex(([lat, lon]) => lat === clampedLat && lon === clampedLon);

      if (oldHitIndex < 0) {
        clampedSet.push([clampedLat, clampedLon, hits]);
      } else {
        clampedSet[oldHitIndex][2] += hits;
      }
    }
    return clampedSet;
  }

  private getMinMaxHits(dataPoints: [number, number, number][]) {
    const dataHits = dataPoints.map(dataPoint => dataPoint[2]);

    return {
      min: Math.min(...dataHits),
      max: Math.max(...dataHits)
    }
  }

  private transformDataPoints(rawDataPoints:[number, number, number][]):[number, number, number, number][] {
    const clampedDataPoints = this.clampDataPoints(rawDataPoints);
    const {min, max} = this.getMinMaxHits(clampedDataPoints);

    const normalizeHits = normalize(min, max, 0, 1);

    return clampedDataPoints.map(clampedDataPoint => ([
      ...this.GCStoCartesian(clampedDataPoint[0], clampedDataPoint[1]),
      normalizeHits(clampedDataPoint[2]) + Math.random() / 100,
    ]));
  }

  private GCStoCartesian(lat: number, lon: number, radius = Earth.radius):[number, number, number] {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return [x, y, z];
  }

  private updateScene(dt: number) {
    this.#earth?.update(dt);
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => {
      this.#camera.aspect = window.innerWidth / window.innerHeight;
      this.#camera.updateProjectionMatrix();
      this.#renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
  }
}

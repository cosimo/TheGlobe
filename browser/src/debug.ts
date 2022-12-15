import { GUI } from "lil-gui";
import Stats from "three/examples/jsm/libs/stats.module";

export const stats = Stats();

export const showDebug = window.location.hash === '#debug';

export const gui = new GUI({
  title: 'The Globe',
});

if (!showDebug) {
  gui.hide();
} else {
  document.body.append(stats.dom);
}

import {WireCollection} from 'w-gl';

export default class PinLayer {
  constructor(size = 50) {
    this.scene = null;    // internal w-gl scene
    this.size = size;
    this.lines = null;
    this.hidden = true;
    this.id = 'pin';
  }

  setSize(size) {
    this.size = size;
    if (this.lines) {
      // easiest: rebuild on next setPosition()
      if (this.scene) this.scene.removeChild(this.lines);
      this.lines = null;
      this.hidden = true;
    }
  }

  bindToScene(scene) {
    // NOTE: this receives the internal w-gl scene from createScene.add() [file:50]
    this.scene = scene;
    if (!this.hidden && this.lines) {
      this.scene.appendChild(this.lines);
      this.scene.renderFrame(true);
    }
  }

  getViewBox() {
    // don't affect camera/viewBox; only GridLayer should set it [file:50][file:201]
    return null;
  }

  setPosition(x, y) {
    if (!this.scene) return;

    // remove old
    if (this.lines && !this.hidden) this.scene.removeChild(this.lines);

    const s = this.size;
    const lines = new WireCollection(4, { width: 6, allowColors: false, is3D: false });

    lines.add({ from: { x: x - s, y, z: 0 }, to: { x: x + s, y, z: 0 } });
    lines.add({ from: { x, y: y - s, z: 0 }, to: { x, y: y + s, z: 0 } });

    lines.color = { r: 1, g: 0, b: 0, a: 1 };
    lines.id = this.id;

    this.lines = lines;
    this.hidden = false;

    this.scene.appendChild(this.lines);
    this.scene.renderFrame(true);
  }

  destroy() {
    if (this.scene && this.lines && !this.hidden) {
      this.scene.removeChild(this.lines);
    }
    this.lines = null;
    this.scene = null;
    this.hidden = true;
  }
}


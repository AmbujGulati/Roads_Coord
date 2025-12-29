import config from '../config.js';
import tinycolor from 'tinycolor2';
import { WireCollection } from 'w-gl';

let counter = 0;

export default class GridLayer {
  get color() {
    return this._color;
  }

  set color(unsafeColor) {
    let color = tinycolor(unsafeColor);
    this._color = color;
    if (this.lines) {
      this.lines.color = toRatioColor(color.toRgb());
    }
    if (this.scene) {
      this.scene.renderFrame();
    }
  }

  get lineWidth() {
    return this._lineWidth;
  }

  set lineWidth(newValue) {
    this._lineWidth = newValue;
    if (!this.lines || !this.scene) return;
    this.lines.setLineWidth(newValue);
  }

  constructor() {
    this._color = config.getDefaultLineColor();
    this.grid = null;
    this.lines = null;
    this.scene = null;
    this.dx = 0;
    this.dy = 0;
    this.scale = 1;
    this.hidden = false;
    this.id = 'paths_' + counter;
    this._lineWidth = 1;

    // --- NEW: optional pin injected into same WireCollection ---
    this._pin = null;     // {x, y} in projected coords
    this._pinSize = null; // projected units

    counter += 1;
  }

  // --- NEW API ---
  setPin(x, y, size) {
    this._pin = { x, y };
    this._pinSize = size;

    // Rebuild geometry (important because WireCollection is pre-sized)
    if (this.scene && this.lines) this.scene.removeChild(this.lines);
    this.lines = null;

    if (this.scene && !this.hidden) {
      this.buildLinesCollection();
      this.scene.appendChild(this.lines);
      this.scene.renderFrame(true);
    }
  }

  clearPin() {
    this._pin = null;
    this._pinSize = null;

    if (this.scene && this.lines) this.scene.removeChild(this.lines);
    this.lines = null;

    if (this.scene && !this.hidden) {
      this.buildLinesCollection();
      this.scene.appendChild(this.lines);
      this.scene.renderFrame(true);
    }
  }

  getGridProjector() {
    if (this.grid) return this.grid.projector;
  }

  getQueryBounds() {
    const { grid } = this;
    if (grid) {
      if (grid.queryBounds) return grid.queryBounds;
      if (grid.isArea) return { areaId: grid.id };
    }
  }

  setGrid(grid) {
    this.grid = grid;
    if (this.scene) {
      this.bindToScene(this.scene);
    }
  }

  getViewBox() {
    if (!this.grid) return null;

    let { width, height } = this.grid.getProjectedRect();
    let initialSceneSize = Math.max(width, height) / 4;
    return {
      left: -initialSceneSize,
      top: initialSceneSize,
      right: initialSceneSize,
      bottom: -initialSceneSize,
    };
  }

  moveTo(x, y = 0) {
    console.warn('Please use moveBy() instead. The moveTo() is under construction');
  }

  moveBy(dx, dy = 0) {
    this.dx = dx;
    this.dy = dy;
    this._transferTransform();
  }

  buildLinesCollection() {
    if (this.lines) return this.lines;
    let grid = this.grid;

    // +2 segments if pin is enabled (horizontal + vertical)
    const extra = this._pin ? 2 : 0;
    let lines = new WireCollection(grid.wayPointCount + extra, {
      width: this._lineWidth,
      allowColors: false,
      is3D: false,
    });

    grid.forEachWay(function (from, to) {
      lines.add({ from, to });
    });

    // --- NEW: Inject pin segments into same collection ---
    if (this._pin && Number.isFinite(this._pin.x) && Number.isFinite(this._pin.y)) {
      const rect = grid.getProjectedRect();
      const s = this._pinSize != null ? this._pinSize : (Math.max(rect.width, rect.height) / 200);

      const x = this._pin.x;
      const y = this._pin.y;

      lines.add({ from: { x: x - s, y, z: 0 }, to: { x: x + s, y, z: 0 } });
      lines.add({ from: { x, y: y - s, z: 0 }, to: { x, y: y + s, z: 0 } });
    }

    let color = tinycolor(this._color).toRgb();
    lines.color = toRatioColor(color);
    lines.id = this.id;

    this.lines = lines;
    return this.lines;
  }

  destroy() {
    if (!this.scene || !this.lines) return;
    this.scene.removeChild(this.lines);
  }

  bindToScene(scene) {
    if (this.scene && this.lines) {
      console.error('You seem to be adding this layer twice...');
    }

    this.scene = scene;
    if (!this.grid) return;

    this.buildLinesCollection();

    if (this.hidden) return;
    this.scene.appendChild(this.lines);
  }

  hide() {
    if (this.hidden) return;
    this.hidden = true;
    if (!this.scene || !this.grid) return;
    this.scene.removeChild(this.lines);
  }

  show() {
    if (!this.hidden) return;
    this.hidden = false;
    if (!this.scene || !this.grid) {
      console.log('Layer will be shown when grid is available');
      return;
    }
    this.scene.appendChild(this.lines);
  }

  _transferTransform() {
    if (!this.lines) return;

    this.lines.translate([this.dx, this.dy, 0]);
    this.lines.updateWorldTransform(true);
    if (this.scene) {
      this.scene.renderFrame(true);
    }
  }
}

function toRatioColor(c) {
  return { r: c.r / 0xff, g: c.g / 0xff, b: c.b / 0xff, a: c.a };
}


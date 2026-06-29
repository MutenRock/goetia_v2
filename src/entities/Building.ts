import Phaser from 'phaser';
import type { BuildingKind } from '../core/types';

const COLORS: Record<BuildingKind, number> = {
  house: 0x8f5b3d,
  chapel: 0xd7d0b0,
  barracks: 0x705669,
  barn: 0xa45530
};

export class Building extends Phaser.GameObjects.Container {
  public readonly kind: BuildingKind;
  public hp: number;
  public maxHp: number;
  public bounds: Phaser.Geom.Rectangle;
  private bodyRect: Phaser.GameObjects.Rectangle;
  private roof: Phaser.GameObjects.Triangle;
  private label: Phaser.GameObjects.Text;
  private hpBar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, kind: BuildingKind, x: number, y: number, width: number, height: number, hp: number) {
    super(scene, x, y);
    this.kind = kind;
    this.hp = hp;
    this.maxHp = hp;
    this.bounds = new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height);

    this.bodyRect = scene.add.rectangle(0, 8, width, height - 22, COLORS[kind], 1).setStrokeStyle(3, 0x1d1520);
    this.roof = scene.add.triangle(0, -height / 2 + 10, -width / 2 - 8, 0, width / 2 + 8, 0, 0, -38, 0x2a1b20, 1);
    this.label = scene.add.text(0, -height / 2 + 32, kind.toUpperCase(), {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#120b18'
    }).setOrigin(0.5);
    this.hpBar = scene.add.rectangle(0, -height / 2 - 10, width, 5, 0x93c47d, 1).setOrigin(0.5);

    this.add([this.bodyRect, this.roof, this.label, this.hpBar]);
    this.setDepth(5);
    scene.add.existing(this);
  }

  damage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    this.bodyRect.setFillStyle(0xffffff);
    this.scene.time.delayedCall(65, () => this.bodyRect.setFillStyle(COLORS[this.kind]));
    this.hpBar.width = Math.max(0, this.bounds.width * (this.hp / this.maxHp));
    if (this.hp <= 0) {
      this.collapse();
      return true;
    }
    return false;
  }

  collapse(): void {
    this.setActive(false);
    this.setAlpha(0.35);
    this.setScale(1, 0.72);
    this.y += 18;
  }
}

import Phaser from 'phaser';
import type { BuildingKind } from '../core/types';

const COLORS: Record<BuildingKind, number> = {
  house: 0x8f5b3d,
  chapel: 0xd7d0b0,
  barracks: 0x705669,
  barn: 0xa45530
};

const LABELS: Record<BuildingKind, string> = {
  house: 'MAISON',
  chapel: 'CHAPELLE',
  barracks: 'CASERNE',
  barn: 'GRANGE'
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
  private aura?: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, kind: BuildingKind, x: number, y: number, width: number, height: number, hp: number) {
    super(scene, x, y);
    this.kind = kind;
    this.hp = hp;
    this.maxHp = hp;
    this.bounds = new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height);

    this.bodyRect = scene.add.rectangle(0, 8, width, height - 22, COLORS[kind], 1).setStrokeStyle(3, 0x1d1520);
    this.roof = scene.add.triangle(0, -height / 2 + 10, -width / 2 - 8, 0, width / 2 + 8, 0, 0, -38, 0x2a1b20, 1);
    this.label = scene.add.text(0, -height / 2 + 32, LABELS[kind], {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#120b18'
    }).setOrigin(0.5);
    this.hpBar = scene.add.rectangle(0, -height / 2 - 10, width, 5, 0x93c47d, 1).setOrigin(0.5);

    const children: Phaser.GameObjects.GameObject[] = [];
    if (kind === 'chapel') {
      this.aura = scene.add.ellipse(0, 8, 260, 260, 0xffffff, 0.04).setStrokeStyle(2, 0xffffff, 0.18);
      children.push(this.aura);
    }

    this.add([...children, this.bodyRect, this.roof, this.label, this.hpBar]);
    this.setDepth(5);
    scene.add.existing(this);
  }

  updateBuilding(timeMs: number): void {
    if (!this.active || !this.aura) return;
    const pulse = 1 + Math.sin(timeMs / 360) * 0.035;
    this.aura.setScale(pulse);
    this.aura.setAlpha(0.05 + Math.sin(timeMs / 500) * 0.015);
  }

  damage(amount: number): boolean {
    if (!this.active) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.bodyRect.setFillStyle(0xffffff);
    this.scene.time.delayedCall(65, () => {
      if (this.active) this.bodyRect.setFillStyle(COLORS[this.kind]);
    });
    this.hpBar.width = Math.max(0, this.bounds.width * (this.hp / this.maxHp));
    if (this.hp <= 0) {
      this.collapse();
      return true;
    }
    return false;
  }

  collapse(): void {
    if (!this.active) return;
    this.setActive(false);
    this.setAlpha(0.35);
    this.setScale(1, 0.72);
    this.y += 18;
    this.aura?.setVisible(false);
  }

  getSpawnPoint(): Phaser.Math.Vector2 {
    const x = this.x + Phaser.Math.Between(-Math.floor(this.bounds.width * 0.3), Math.floor(this.bounds.width * 0.3));
    return new Phaser.Math.Vector2(x, this.bounds.bottom - 18);
  }
}

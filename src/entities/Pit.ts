import Phaser from 'phaser';
import { WORLD } from '../core/constants';
import type { Cost } from '../core/types';

export class Pit extends Phaser.GameObjects.Container {
  public hp = 260;
  public maxHp = 260;
  public readonly dropZone: Phaser.Geom.Rectangle;
  private hpBar: Phaser.GameObjects.Rectangle;
  private pulse: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x = 850, y = WORLD.groundY - 24) {
    super(scene, x, y);
    this.dropZone = new Phaser.Geom.Rectangle(x - 70, y - 55, 140, 80);

    const mouth = scene.add.ellipse(0, 22, 150, 48, 0x080509, 1).setStrokeStyle(4, 0x59306c);
    this.pulse = scene.add.ellipse(0, 22, 118, 28, 0x4f1e60, 0.45);
    const sigil = scene.add.star(0, -16, 5, 18, 36, 0x9ddf7c, 0.85).setStrokeStyle(2, 0x080509);
    const label = scene.add.text(0, -62, 'FOSSE / CLAVIS', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#efe9d4'
    }).setOrigin(0.5);
    this.hpBar = scene.add.rectangle(0, -44, 130, 7, 0x93c47d, 1).setOrigin(0.5);

    this.add([mouth, this.pulse, sigil, label, this.hpBar]);
    this.setDepth(8);
    scene.add.existing(this);

    scene.tweens.add({
      targets: this.pulse,
      scaleX: 1.18,
      scaleY: 1.35,
      alpha: 0.18,
      duration: 900,
      yoyo: true,
      repeat: -1
    });
  }

  damage(amount: number): boolean {
    this.hp = Math.max(0, this.hp - amount);
    this.hpBar.width = 130 * (this.hp / this.maxHp);
    return this.hp <= 0;
  }

  contains(x: number, y: number): boolean {
    return Phaser.Geom.Rectangle.Contains(this.dropZone, x, y);
  }

  canCraft(resources: { souls: number; bodies: number }, cost: Cost): boolean {
    return resources.souls >= cost.souls && resources.bodies >= cost.bodies;
  }
}

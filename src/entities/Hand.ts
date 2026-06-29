import Phaser from 'phaser';
import { DEPTH, WORLD } from '../core/constants';

export class Hand extends Phaser.GameObjects.Container {
  private palm: Phaser.GameObjects.Ellipse;
  private sigil: Phaser.GameObjects.Star;
  private shadow: Phaser.GameObjects.Ellipse;
  private fingers: Phaser.GameObjects.Rectangle[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.shadow = scene.add.ellipse(0, WORLD.groundY - y + 12, 74, 18, 0x000000, 0.25);
    this.palm = scene.add.ellipse(0, 8, 58, 68, 0x160d1f, 0.96).setStrokeStyle(3, 0xa266c7, 0.9);
    this.sigil = scene.add.star(0, 10, 5, 8, 16, 0x9ddf7c, 0.9);
    for (let i = 0; i < 5; i++) {
      const finger = scene.add.rectangle(-24 + i * 12, -34 - Math.abs(i - 2) * 4, 9, 42 - Math.abs(i - 2) * 5, 0x160d1f, 0.95)
        .setStrokeStyle(2, 0xa266c7, 0.85);
      this.fingers.push(finger);
    }
    this.add([this.shadow, ...this.fingers, this.palm, this.sigil]);
    this.setDepth(DEPTH.hand);
    scene.add.existing(this);
  }

  setClosed(closed: boolean): void {
    this.palm.setScale(closed ? 0.9 : 1);
    this.sigil.setScale(closed ? 0.7 : 1);
    this.shadow.setScale(closed ? 1.12 : 1, closed ? 1.18 : 1);
    this.fingers.forEach((finger, index) => {
      finger.rotation = closed ? Phaser.Math.DegToRad((index - 2) * -10) : 0;
      finger.y = closed ? -20 : -34 - Math.abs(index - 2) * 4;
    });
  }

  setPosition(x?: number, y?: number, z?: number, w?: number): this {
    super.setPosition(x, y, z, w);
    if (this.shadow && y !== undefined) {
      const height = Phaser.Math.Clamp(WORLD.groundY - y, 20, 360);
      this.shadow.y = height + 12;
      this.shadow.setAlpha(Phaser.Math.Clamp(0.35 - height / 1100, 0.08, 0.32));
    }
    return this;
  }

  pulseGrab(): void {
    this.scene.tweens.add({
      targets: [this.palm, this.sigil],
      scale: '+=0.08',
      duration: 70,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  }

  pulseExtraction(): void {
    this.scene.tweens.add({
      targets: this.sigil,
      scale: 1.8,
      alpha: 0.2,
      duration: 150,
      yoyo: true
    });
  }
}

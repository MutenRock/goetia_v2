import Phaser from 'phaser';
import { DEPTH } from '../core/constants';

export class Hand extends Phaser.GameObjects.Container {
  private palm: Phaser.GameObjects.Ellipse;
  private sigil: Phaser.GameObjects.Star;
  private fingers: Phaser.GameObjects.Rectangle[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.palm = scene.add.ellipse(0, 8, 58, 68, 0x160d1f, 0.96).setStrokeStyle(3, 0xa266c7, 0.9);
    this.sigil = scene.add.star(0, 10, 5, 8, 16, 0x9ddf7c, 0.9);
    for (let i = 0; i < 5; i++) {
      const finger = scene.add.rectangle(-24 + i * 12, -34 - Math.abs(i - 2) * 4, 9, 42 - Math.abs(i - 2) * 5, 0x160d1f, 0.95)
        .setStrokeStyle(2, 0xa266c7, 0.85);
      this.fingers.push(finger);
    }
    this.add([...this.fingers, this.palm, this.sigil]);
    this.setDepth(DEPTH.hand);
    scene.add.existing(this);
  }

  setClosed(closed: boolean): void {
    this.palm.setScale(closed ? 0.9 : 1);
    this.sigil.setScale(closed ? 0.7 : 1);
    this.fingers.forEach((finger, index) => {
      finger.rotation = closed ? Phaser.Math.DegToRad((index - 2) * -10) : 0;
      finger.y = closed ? -20 : -34 - Math.abs(index - 2) * 4;
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

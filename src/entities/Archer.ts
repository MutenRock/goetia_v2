import Phaser from 'phaser';
import { BALANCE } from '../core/balance';
import { LivingUnit } from './LivingUnit';

export class Archer extends Phaser.Physics.Arcade.Sprite {
  public hp = BALANCE.archer.hp;
  private cooldown = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'archer');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(21);
    this.setCollideWorldBounds(true);
    this.setData('kind', 'archer');
  }

  updateArcher(guards: LivingUnit[], deltaMs: number): LivingUnit | null {
    this.cooldown -= deltaMs;
    if (this.cooldown > 0) return null;
    const targets = guards.filter((guard) => guard.active && Phaser.Math.Distance.Between(this.x, this.y, guard.x, guard.y) <= BALANCE.archer.range);
    targets.sort((a, b) => Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) - Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y));
    const target = targets[0];
    if (!target) return null;
    this.cooldown = BALANCE.archer.cooldownMs;
    this.fireAt(target);
    return target;
  }

  private fireAt(target: LivingUnit): void {
    const line = this.scene.add.line(0, 0, this.x, this.y - 8, target.x, target.y - 8, 0x9ddf7c, 0.85).setOrigin(0, 0).setDepth(50);
    this.scene.tweens.add({
      targets: line,
      alpha: 0,
      duration: 130,
      onComplete: () => line.destroy()
    });
  }
}

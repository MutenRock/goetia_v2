import Phaser from 'phaser';
import { BALANCE } from '../core/balance';
import type { BodyType } from '../core/types';

export class Corpse extends Phaser.Physics.Arcade.Sprite {
  public readonly bodyType: BodyType;
  public freshness = BALANCE.corpse.freshnessMax;
  public soulExtracted = false;
  public claimed = false;
  public carried = false;

  constructor(scene: Phaser.Scene, x: number, y: number, bodyType: BodyType) {
    super(scene, x, y, `corpse-${bodyType}`);
    this.bodyType = bodyType;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(15);
    this.setDrag(280, 0);
    this.setBounce(0.1);
    this.setCollideWorldBounds(true);
    this.setData('kind', 'corpse');
  }

  decay(deltaSeconds: number): void {
    if (this.carried) return;
    this.freshness = Math.max(0, this.freshness - BALANCE.corpse.decayPerSecond * deltaSeconds);
    this.setAlpha(0.35 + 0.65 * (this.freshness / BALANCE.corpse.freshnessMax));
  }

  purify(deltaSeconds: number): boolean {
    if (this.carried) return false;
    this.freshness = Math.max(0, this.freshness - BALANCE.corpse.purifyPerSecond * deltaSeconds);
    this.setTint(0xffffff);
    return this.freshness <= 0;
  }
}

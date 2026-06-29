import Phaser from 'phaser';
import { BALANCE } from '../core/balance';
import { DEPTH } from '../core/constants';
import type { BodyType } from '../core/types';

export class Corpse extends Phaser.Physics.Arcade.Sprite {
  public readonly bodyType: BodyType;
  public freshness: number = BALANCE.corpse.freshnessMax;
  public soulExtracted = false;
  public claimed = false;
  public carried = false;
  public priority = false;

  private soulGlow: Phaser.GameObjects.Ellipse;
  private priorityRing: Phaser.GameObjects.Ellipse;
  private purifyHalo: Phaser.GameObjects.Ellipse;

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

    this.soulGlow = scene.add.ellipse(x, y - 10, 18, 10, 0x9ddf7c, 0.45).setDepth(DEPTH.effects);
    this.priorityRing = scene.add.ellipse(x, y, 50, 28).setStrokeStyle(2, 0xf0c96a, 0).setDepth(DEPTH.effects);
    this.purifyHalo = scene.add.ellipse(x, y, 54, 30).setStrokeStyle(2, 0xffffff, 0).setDepth(DEPTH.effects);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.syncMarkers();
    this.soulGlow.setScale(1 + Math.sin(time / 120) * 0.08);
    this.priorityRing.setScale(1 + Math.sin(time / 90) * 0.06);
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
    this.purifyHalo.setStrokeStyle(2, 0xffffff, 0.75);
    this.scene.time.delayedCall(90, () => {
      if (this.active) this.purifyHalo.setStrokeStyle(2, 0xffffff, 0.12);
    });
    return this.freshness <= 0;
  }

  markSoulExtracted(): void {
    this.soulExtracted = true;
    this.soulGlow.setVisible(false);
    this.setTint(0x8bd8a8);
  }

  setPriority(priority: boolean): void {
    this.priority = priority;
    this.priorityRing.setStrokeStyle(2, 0xf0c96a, priority ? 0.95 : 0);
  }

  override destroy(fromScene?: boolean): void {
    this.soulGlow.destroy();
    this.priorityRing.destroy();
    this.purifyHalo.destroy();
    super.destroy(fromScene);
  }

  private syncMarkers(): void {
    this.soulGlow.setPosition(this.x, this.y - 10);
    this.priorityRing.setPosition(this.x, this.y + 1);
    this.purifyHalo.setPosition(this.x, this.y + 1);
  }
}

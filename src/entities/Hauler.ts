import Phaser from 'phaser';
import { BALANCE } from '../core/balance';
import { WORLD } from '../core/constants';
import { Corpse } from './Corpse';
import { Pit } from './Pit';

export class Hauler extends Phaser.Physics.Arcade.Sprite {
  public hp = BALANCE.hauler.hp;
  public targetCorpse: Corpse | null = null;
  public carriedCorpse: Corpse | null = null;
  public mode: 'idle' | 'toCorpse' | 'toPit' = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'hauler');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(22);
    this.setCollideWorldBounds(true);
    this.setDragX(300);
    this.setData('kind', 'hauler');
  }

  updateHauler(corpses: Corpse[], pit: Pit, deltaMs: number): boolean {
    if (!this.active) return false;

    if (this.carriedCorpse) {
      this.carriedCorpse.setPosition(this.x, this.y + 20);
    }

    if (this.mode === 'idle') {
      this.targetCorpse = this.findTarget(corpses);
      if (this.targetCorpse) {
        this.targetCorpse.claimed = true;
        this.mode = 'toCorpse';
      } else {
        this.moveToward(pit.x - 26, WORLD.groundY - 22, BALANCE.hauler.speed * 0.5);
      }
    }

    if (this.mode === 'toCorpse' && this.targetCorpse) {
      if (!this.targetCorpse.active || this.targetCorpse.carried) {
        this.targetCorpse = null;
        this.mode = 'idle';
        return false;
      }
      this.moveToward(this.targetCorpse.x, this.targetCorpse.y, BALANCE.hauler.speed);
      if (Phaser.Math.Distance.Between(this.x, this.y, this.targetCorpse.x, this.targetCorpse.y) < 24) {
        this.carriedCorpse = this.targetCorpse;
        this.carriedCorpse.carried = true;
        this.carriedCorpse.disableBody(true, false);
        this.targetCorpse = null;
        this.mode = 'toPit';
      }
    }

    if (this.mode === 'toPit') {
      this.moveToward(pit.x, WORLD.groundY - 26, BALANCE.hauler.carrySpeed);
      if (pit.contains(this.x, this.y)) {
        if (this.carriedCorpse) {
          this.carriedCorpse.destroy();
          this.carriedCorpse = null;
        }
        this.mode = 'idle';
        return true;
      }
    }

    this.flipX = this.body?.velocity.x !== undefined && this.body.velocity.x < 0;
    return false;
  }

  receiveDamage(amount: number): boolean {
    this.hp -= amount;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => this.clearTint());
    return this.hp <= 0;
  }

  private findTarget(corpses: Corpse[]): Corpse | null {
    const available = corpses.filter((corpse) => corpse.active && !corpse.claimed && !corpse.carried && corpse.soulExtracted);
    available.sort((a, b) => Phaser.Math.Distance.Between(this.x, this.y, a.x, a.y) - Phaser.Math.Distance.Between(this.x, this.y, b.x, b.y));
    return available[0] ?? null;
  }

  private moveToward(x: number, y: number, speed: number): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed * 0.2);
  }
}

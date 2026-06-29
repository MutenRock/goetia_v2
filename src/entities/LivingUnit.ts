import Phaser from 'phaser';
import { BALANCE } from '../core/balance';
import { WORLD } from '../core/constants';
import type { LivingKind } from '../core/types';

export class LivingUnit extends Phaser.Physics.Arcade.Sprite {
  public readonly kind: LivingKind;
  public hp: number;
  public panic = 0;
  public isHeld = false;
  public isThrown = false;
  public lastGroundImpact = 0;
  private moveDir = 1;
  private decisionTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: LivingKind) {
    super(scene, x, y, kind);
    this.kind = kind;
    this.hp = kind === 'guard' ? BALANCE.living.guardHp : BALANCE.living.peasantHp;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(20);
    this.setCollideWorldBounds(true);
    this.setBounce(0.18);
    this.setDragX(80);
    this.setData('kind', kind);
  }

  aiUpdate(deltaMs: number, handX: number): void {
    if (this.isHeld || this.isThrown || !this.active) return;

    this.decisionTimer -= deltaMs;
    if (this.decisionTimer <= 0) {
      this.decisionTimer = Phaser.Math.Between(600, 1400);
      if (this.kind === 'peasant') {
        const fearDir = this.x < handX ? -1 : 1;
        this.moveDir = Math.abs(this.x - handX) < 180 ? fearDir : Phaser.Math.RND.pick([-1, 1]);
      } else {
        this.moveDir = this.x < 825 ? 1 : -1;
      }
    }

    const speed = this.kind === 'guard' ? BALANCE.guard.speed : 48 + this.panic * 18;
    this.setVelocityX(this.moveDir * speed);

    if (this.x < 24) this.moveDir = 1;
    if (this.x > WORLD.rightWall - 24) this.moveDir = -1;
  }

  receiveDamage(amount: number): boolean {
    this.hp -= amount;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => this.clearTint());
    return this.hp <= 0;
  }

  markThrown(): void {
    this.isThrown = true;
    this.isHeld = false;
  }
}

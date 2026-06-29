import Phaser from 'phaser';
import { BALANCE } from '../core/balance';
import { LivingUnit } from '../entities/LivingUnit';
import { Corpse } from '../entities/Corpse';

type Grabbable = LivingUnit | Corpse;

export class GrabSystem {
  public held: Grabbable | null = null;
  private lastPointer = new Phaser.Math.Vector2();
  private currentPointer = new Phaser.Math.Vector2();

  updatePointer(x: number, y: number): void {
    this.lastPointer.copy(this.currentPointer);
    this.currentPointer.set(x, y);
    if (this.held) {
      this.held.setPosition(x, y + 28);
      this.held.setVelocity(0, 0);
    }
  }

  tryGrab(pointer: Phaser.Input.Pointer, units: LivingUnit[], corpses: Corpse[]): Grabbable | null {
    const candidates: Grabbable[] = [...units.filter((u) => u.active), ...corpses.filter((c) => c.active && !c.carried)];
    candidates.sort((a, b) => Phaser.Math.Distance.Between(pointer.x, pointer.y, a.x, a.y) - Phaser.Math.Distance.Between(pointer.x, pointer.y, b.x, b.y));
    const nearest = candidates[0];
    if (!nearest) return null;
    if (Phaser.Math.Distance.Between(pointer.x, pointer.y, nearest.x, nearest.y) > BALANCE.hand.grabRadius) return null;

    this.held = nearest;
    nearest.setVelocity(0, 0);
    nearest.setDepth(80);
    if (nearest instanceof LivingUnit) nearest.isHeld = true;
    if (nearest instanceof Corpse) nearest.claimed = true;
    return nearest;
  }

  release(): { target: Grabbable; vx: number; vy: number } | null {
    if (!this.held) return null;
    const target = this.held;
    this.held = null;

    const vx = Phaser.Math.Clamp((this.currentPointer.x - this.lastPointer.x) * BALANCE.hand.throwMultiplier * 60, -BALANCE.hand.maxThrowSpeed, BALANCE.hand.maxThrowSpeed);
    const vy = Phaser.Math.Clamp((this.currentPointer.y - this.lastPointer.y) * BALANCE.hand.throwMultiplier * 60, -BALANCE.hand.maxThrowSpeed, BALANCE.hand.maxThrowSpeed);
    target.setVelocity(vx, vy);
    target.setDepth(target instanceof Corpse ? 15 : 20);

    if (target instanceof LivingUnit) target.markThrown();
    if (target instanceof Corpse) target.claimed = false;

    return { target, vx, vy };
  }
}

import Phaser from 'phaser';
import { BALANCE } from '../core/balance';
import { LivingUnit } from '../entities/LivingUnit';
import { Hauler } from '../entities/Hauler';
import { Pit } from '../entities/Pit';

export class CombatSystem {
  private guardCooldowns = new WeakMap<LivingUnit, number>();

  updateGuards(guards: LivingUnit[], haulers: Hauler[], pit: Pit, deltaMs: number): { pitDamage: number; deadHaulers: Hauler[] } {
    const deadHaulers: Hauler[] = [];
    let pitDamage = 0;

    for (const guard of guards) {
      if (!guard.active) continue;
      const currentCd = Math.max(0, (this.guardCooldowns.get(guard) ?? 0) - deltaMs);
      this.guardCooldowns.set(guard, currentCd);
      const targetHauler = this.closestHauler(guard, haulers);

      if (targetHauler && Phaser.Math.Distance.Between(guard.x, guard.y, targetHauler.x, targetHauler.y) < BALANCE.guard.attackRange) {
        guard.setVelocityX(0);
        if (currentCd <= 0) {
          this.guardCooldowns.set(guard, BALANCE.guard.attackCooldownMs);
          if (targetHauler.receiveDamage(BALANCE.guard.attackDamage)) deadHaulers.push(targetHauler);
        }
        continue;
      }

      if (Phaser.Math.Distance.Between(guard.x, guard.y, pit.x, pit.y) < BALANCE.guard.attackRange + 30) {
        guard.setVelocityX(0);
        if (currentCd <= 0) {
          this.guardCooldowns.set(guard, BALANCE.guard.attackCooldownMs);
          pitDamage += BALANCE.guard.attackDamage;
        }
      }
    }

    return { pitDamage, deadHaulers };
  }

  private closestHauler(guard: LivingUnit, haulers: Hauler[]): Hauler | null {
    const active = haulers.filter((hauler) => hauler.active);
    active.sort((a, b) => Phaser.Math.Distance.Between(guard.x, guard.y, a.x, a.y) - Phaser.Math.Distance.Between(guard.x, guard.y, b.x, b.y));
    return active[0] ?? null;
  }
}

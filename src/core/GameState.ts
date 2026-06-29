import { BALANCE } from './balance';
import type { Cost, Resources } from './types';

export class GameState {
  public resources: Resources = {
    souls: BALANCE.pit.startSouls,
    bodies: BALANCE.pit.startBodies,
    stability: 100,
    purified: 0,
    processed: 0,
    score: 0,
    combo: 0,
    maxCombo: 0
  };

  public wave = 1;
  public status: 'playing' | 'victory' | 'defeat' = 'playing';
  private comboExpiresAt = 0;

  canPay(cost: Cost): boolean {
    return this.resources.souls >= cost.souls && this.resources.bodies >= cost.bodies;
  }

  pay(cost: Cost): boolean {
    if (!this.canPay(cost)) return false;
    this.resources.souls -= cost.souls;
    this.resources.bodies -= cost.bodies;
    return true;
  }

  tick(timeMs: number): void {
    if (this.resources.combo > 0 && timeMs > this.comboExpiresAt) {
      this.resources.combo = 0;
    }
  }

  addScore(base: number, timeMs: number): number {
    this.resources.combo += 1;
    this.resources.maxCombo = Math.max(this.resources.maxCombo, this.resources.combo);
    this.comboExpiresAt = timeMs + 1800;
    const comboMultiplier = 1 + Math.min(4, this.resources.combo - 1) * 0.25;
    const gained = Math.round(base * comboMultiplier);
    this.resources.score += gained;
    return gained;
  }
}

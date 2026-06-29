import { BALANCE } from './balance';
import type { Cost, Resources } from './types';

export class GameState {
  public resources: Resources = {
    souls: BALANCE.pit.startSouls,
    bodies: BALANCE.pit.startBodies,
    stability: 100,
    purified: 0,
    processed: 0
  };

  public wave = 1;
  public status: 'playing' | 'victory' | 'defeat' = 'playing';

  canPay(cost: Cost): boolean {
    return this.resources.souls >= cost.souls && this.resources.bodies >= cost.bodies;
  }

  pay(cost: Cost): boolean {
    if (!this.canPay(cost)) return false;
    this.resources.souls -= cost.souls;
    this.resources.bodies -= cost.bodies;
    return true;
  }
}

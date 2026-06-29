import Phaser from 'phaser';
import { BALANCE } from '../core/balance';
import { Corpse } from '../entities/Corpse';

export class SoulExtractionSystem {
  private cooldown = 0;

  update(deltaMs: number): void {
    this.cooldown = Math.max(0, this.cooldown - deltaMs);
  }

  tryExtract(scene: Phaser.Scene, x: number, y: number, corpses: Corpse[]): Corpse | null {
    if (this.cooldown > 0) return null;
    const candidates = corpses.filter((corpse) => corpse.active && !corpse.soulExtracted && Phaser.Math.Distance.Between(x, y, corpse.x, corpse.y) <= BALANCE.hand.extractRange);
    candidates.sort((a, b) => Phaser.Math.Distance.Between(x, y, a.x, a.y) - Phaser.Math.Distance.Between(x, y, b.x, b.y));
    const corpse = candidates[0];
    if (!corpse) return null;

    corpse.soulExtracted = true;
    corpse.setTint(0x99ffcc);
    this.cooldown = BALANCE.hand.extractCooldownMs;

    const soul = scene.add.circle(corpse.x, corpse.y - 24, 9, 0x9ddf7c, 0.95).setDepth(60);
    scene.tweens.add({
      targets: soul,
      y: corpse.y - 90,
      alpha: 0,
      scale: 2.2,
      duration: 420,
      ease: 'Sine.easeOut',
      onComplete: () => soul.destroy()
    });

    const line = scene.add.line(0, 0, x, y, corpse.x, corpse.y, 0x9ddf7c, 0.8).setOrigin(0, 0).setDepth(59);
    scene.tweens.add({ targets: line, alpha: 0, duration: 140, onComplete: () => line.destroy() });
    return corpse;
  }
}

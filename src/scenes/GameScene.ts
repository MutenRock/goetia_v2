import Phaser from 'phaser';
import { WORLD, DEPTH } from '../core/constants';
import { BALANCE } from '../core/balance';
import { GameState } from '../core/GameState';
import { LEVELS } from '../data/levels';
import { Hand } from '../entities/Hand';
import { LivingUnit } from '../entities/LivingUnit';
import { Corpse } from '../entities/Corpse';
import { Building } from '../entities/Building';
import { Pit } from '../entities/Pit';
import { Hauler } from '../entities/Hauler';
import { Archer } from '../entities/Archer';
import { GrabSystem } from '../systems/GrabSystem';
import { SoulExtractionSystem } from '../systems/SoulExtractionSystem';
import { CombatSystem } from '../systems/CombatSystem';
import type { BodyType } from '../core/types';

export class GameScene extends Phaser.Scene {
  private state = new GameState();
  private hand!: Hand;
  private pit!: Pit;
  private grab = new GrabSystem();
  private soulExtraction = new SoulExtractionSystem();
  private combat = new CombatSystem();

  private living: LivingUnit[] = [];
  private corpses: Corpse[] = [];
  private buildings: Building[] = [];
  private haulers: Hauler[] = [];
  private archers: Archer[] = [];

  private hud!: Phaser.GameObjects.Text;
  private centerText!: Phaser.GameObjects.Text;
  private pointerWasRightDown = false;
  private shiftKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.resetScene();
  }

  update(time: number, deltaMs: number): void {
    if (this.state.status !== 'playing') return;
    this.state.tick(time);
    const deltaSeconds = deltaMs / 1000;
    const pointer = this.input.activePointer;
    this.hand.setPosition(pointer.x, pointer.y);
    this.grab.updatePointer(pointer.x, pointer.y);
    this.hand.setClosed(this.grab.held !== null);
    this.soulExtraction.update(deltaMs);

    this.updateLiving(deltaMs);
    this.updateCorpses(deltaSeconds);
    this.updateHaulers(deltaMs);
    this.updateArchers(deltaMs);
    this.updateChapels(deltaSeconds);
    this.updateBuildingImpacts();
    this.updateGuards(deltaMs);
    this.handleRightClickExtraction(pointer);
    this.checkWinLose();
    this.updateHud();
  }

  private resetScene(): void {
    this.children.removeAll();
    this.physics.world.colliders.destroy();
    this.state = new GameState();
    this.living = [];
    this.corpses = [];
    this.buildings = [];
    this.haulers = [];
    this.archers = [];
    this.grab = new GrabSystem();
    this.soulExtraction = new SoulExtractionSystem();
    this.combat = new CombatSystem();

    this.createWorldArt();
    this.createLevel();
    this.createInput();
    this.createHud();
  }

  private createWorldArt(): void {
    this.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 0x140c1c).setDepth(DEPTH.background);
    this.add.rectangle(WORLD.width / 2, WORLD.groundY + 40, WORLD.width, 120, 0x211522).setDepth(1);
    this.add.rectangle(WORLD.width / 2, WORLD.groundY, WORLD.width, 6, 0x5b4255).setDepth(2);

    for (let i = 0; i < 11; i++) {
      const x = i * 96 + 18;
      this.add.triangle(x, WORLD.groundY - 8, -24, 0, 24, 0, 0, -80 - (i % 3) * 28, 0x0d0910, 0.7).setDepth(2);
    }
  }

  private createLevel(): void {
    const level = LEVELS[0];
    for (const spawn of level.buildings) {
      this.buildings.push(new Building(this, spawn.kind, spawn.x, spawn.y, spawn.width, spawn.height, spawn.hp));
    }

    this.pit = new Pit(this);

    for (let i = 0; i < level.peasants; i++) {
      this.spawnLiving('peasant', Phaser.Math.Between(60, 720), WORLD.groundY - 20);
    }
    for (let i = 0; i < level.guards; i++) {
      this.spawnLiving('guard', Phaser.Math.Between(540, 720), WORLD.groundY - 20);
    }
    for (let i = 0; i < BALANCE.pit.startHaulers; i++) {
      this.spawnHauler(this.pit.x - 35 - i * 18, WORLD.groundY - 20);
    }

    this.hand = new Hand(this, 480, 200);
  }

  private createInput(): void {
    this.shiftKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.state.status !== 'playing') return;
      if (pointer.leftButtonDown()) {
        if (this.shiftKey?.isDown) {
          this.togglePriorityAt(pointer.x, pointer.y);
          return;
        }
        const grabbed = this.grab.tryGrab(pointer, this.living, this.corpses);
        if (grabbed) {
          this.hand.pulseGrab();
          this.flashText('saisi', grabbed.x, grabbed.y - 34, '#f0c96a');
        }
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0) {
        const release = this.grab.release();
        if (release) {
          const throwSpeed = Phaser.Math.Distance.Between(0, 0, release.vx, release.vy);
          this.cameras.main.shake(60, 0.003);
          if (throwSpeed > 540) {
            this.addScoreAt(5, release.target.x, release.target.y - 34, 'jet violent');
          }
        }
      }
    });

    this.input.keyboard?.on('keydown-R', () => this.resetScene());
    this.input.keyboard?.on('keydown-ONE', () => this.tryCraftHauler());
    this.input.keyboard?.on('keydown-TWO', () => this.tryCraftArcher());
    this.input.keyboard?.on('keydown-E', () => {
      const p = this.input.activePointer;
      this.extractAt(p.x, p.y);
    });
  }

  private createHud(): void {
    this.hud = this.add.text(14, 12, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#efe9d4',
      backgroundColor: '#100916cc',
      padding: { left: 8, right: 8, top: 6, bottom: 6 }
    }).setDepth(DEPTH.ui);

    this.centerText = this.add.text(WORLD.width / 2, 72, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#efe9d4',
      align: 'center'
    }).setOrigin(0.5).setDepth(DEPTH.ui);

    this.updateHud();
  }

  private updateHud(): void {
    const r = this.state.resources;
    const comboText = r.combo > 0 ? `   Combo: x${r.combo}` : '';
    this.hud.setText([
      'GOETIA v2 / Mortis Prototype',
      'Clic gauche : attraper / jeter   |   Shift+clic : priorité cadavre',
      'Clic droit ou E : extirper âme   |   1 : Bifrons   |   2 : Leraje',
      `Score: ${r.score}${comboText}   Meilleur combo: x${r.maxCombo}`,
      `Âmes: ${r.souls}   Corps: ${r.bodies}   Traités: ${r.processed}   Purifiés: ${r.purified}   Stabilité: ${r.stability}`,
      `Fosse HP: ${this.pit?.hp ?? 0}   Porteurs: ${this.haulers.filter((h) => h.active).length}   Archers: ${this.archers.filter((a) => a.active).length}`
    ]);
  }

  private updateLiving(deltaMs: number): void {
    for (const unit of [...this.living]) {
      if (!unit.active) continue;
      unit.aiUpdate(deltaMs, this.hand.x);
      if (unit.y > WORLD.groundY - 18) {
        const speed = Math.abs(unit.body?.velocity.y ?? 0) + Math.abs(unit.body?.velocity.x ?? 0) * 0.25;
        unit.setY(WORLD.groundY - 18);
        unit.setVelocityY(0);
        if (unit.isThrown && speed > BALANCE.living.impactKillSpeed) {
          this.killLiving(unit, speed / 70);
        } else {
          unit.isThrown = false;
        }
      }
    }
  }

  private updateCorpses(deltaSeconds: number): void {
    for (const corpse of [...this.corpses]) {
      if (!corpse.active) continue;
      corpse.decay(deltaSeconds);
      if (corpse.y > WORLD.groundY - 8) {
        corpse.setY(WORLD.groundY - 8);
        corpse.setVelocityY(0);
      }
      if (corpse.freshness <= 0) this.removeCorpse(corpse);
    }
  }

  private updateHaulers(deltaMs: number): void {
    for (const hauler of [...this.haulers]) {
      if (!hauler.active) continue;
      const deposited = hauler.updateHauler(this.corpses, this.pit, deltaMs);
      if (deposited) {
        this.state.resources.bodies += 1;
        this.state.resources.processed += 1;
        this.addScoreAt(15, this.pit.x, this.pit.y - 90, '+1 corps stocké');
      }
      if (hauler.y > WORLD.groundY - 18) {
        hauler.setY(WORLD.groundY - 18);
        hauler.setVelocityY(0);
      }
    }
  }

  private updateArchers(deltaMs: number): void {
    const guards = this.living.filter((u) => u.kind === 'guard');
    for (const archer of this.archers) {
      if (!archer.active) continue;
      const target = archer.updateArcher(guards, deltaMs);
      if (target && target.receiveDamage(BALANCE.archer.damage)) {
        this.killLiving(target, 1);
      }
    }
  }

  private updateChapels(deltaSeconds: number): void {
    const chapels = this.buildings.filter((building) => building.active && building.kind === 'chapel');
    for (const chapel of chapels) {
      for (const corpse of [...this.corpses]) {
        if (!corpse.active || corpse.carried) continue;
        if (Phaser.Math.Distance.Between(chapel.x, chapel.y, corpse.x, corpse.y) < 130) {
          const purified = corpse.purify(deltaSeconds);
          if (purified) {
            this.state.resources.purified += 1;
            this.flashText('purifié', corpse.x, corpse.y - 24, '#ffffff');
            this.removeCorpse(corpse);
          }
        }
      }
    }
  }

  private updateBuildingImpacts(): void {
    for (const unit of [...this.living]) {
      if (!unit.active || !unit.isThrown) continue;
      const speed = Phaser.Math.Distance.Between(0, 0, unit.body?.velocity.x ?? 0, unit.body?.velocity.y ?? 0);
      if (speed < 360) continue;
      for (const building of this.buildings) {
        if (!building.active) continue;
        if (Phaser.Geom.Rectangle.Contains(building.bounds, unit.x, unit.y)) {
          building.damage(speed * BALANCE.living.impactBuildingDamageFactor);
          this.addScoreAt(20, building.x, building.y - building.bounds.height / 2, 'impact bâtiment');
          this.killLiving(unit, speed / 60);
          this.cameras.main.shake(90, 0.006);
          break;
        }
      }
    }
  }

  private updateGuards(deltaMs: number): void {
    const guards = this.living.filter((unit) => unit.active && unit.kind === 'guard');
    const result = this.combat.updateGuards(guards, this.haulers, this.pit, deltaMs);
    if (result.pitDamage > 0 && this.pit.damage(result.pitDamage)) {
      this.endGame('defeat', 'La fosse est détruite. Les sceaux se brisent.');
    }
    for (const hauler of result.deadHaulers) {
      this.spawnCorpse(hauler.x, hauler.y, 'peasant');
      hauler.destroy();
    }
  }

  private handleRightClickExtraction(pointer: Phaser.Input.Pointer): void {
    const rightDown = pointer.rightButtonDown();
    if (rightDown && !this.pointerWasRightDown) {
      this.extractAt(pointer.x, pointer.y);
    }
    this.pointerWasRightDown = rightDown;
  }

  private extractAt(x: number, y: number): void {
    const corpse = this.soulExtraction.tryExtract(this, x, y, this.corpses);
    if (!corpse) return;
    this.state.resources.souls += corpse.bodyType === 'guard' ? 2 : 1;
    this.hand.pulseExtraction();
    this.addScoreAt(corpse.bodyType === 'guard' ? 20 : 10, corpse.x, corpse.y - 42, corpse.bodyType === 'guard' ? '+2 âmes' : '+1 âme');
  }

  private togglePriorityAt(x: number, y: number): void {
    const candidates = this.corpses
      .filter((corpse) => corpse.active && corpse.soulExtracted && !corpse.carried)
      .sort((a, b) => Phaser.Math.Distance.Between(x, y, a.x, a.y) - Phaser.Math.Distance.Between(x, y, b.x, b.y));
    const corpse = candidates[0];
    if (!corpse || Phaser.Math.Distance.Between(x, y, corpse.x, corpse.y) > 56) {
      this.flashCenter('Aucun cadavre extrait à prioriser');
      return;
    }
    corpse.setPriority(!corpse.priority);
    this.flashText(corpse.priority ? 'priorité' : 'priorité retirée', corpse.x, corpse.y - 32, '#f0c96a');
  }

  private tryCraftHauler(): void {
    if (!this.state.pay(BALANCE.pit.haulerCost)) {
      this.flashCenter('Pas assez de ressources pour Bifrons');
      return;
    }
    this.spawnHauler(this.pit.x - 52, WORLD.groundY - 18);
    this.addScoreAt(25, this.pit.x - 52, WORLD.groundY - 70, 'Sceau de Bifrons');
    this.flashCenter('Sceau de Bifrons : porteur contraint');
  }

  private tryCraftArcher(): void {
    if (!this.state.pay(BALANCE.pit.archerCost)) {
      this.flashCenter('Pas assez de ressources pour Leraje');
      return;
    }
    const archer = new Archer(this, this.pit.x - 112 - this.archers.length * 16, WORLD.groundY - 20);
    this.archers.push(archer);
    this.addScoreAt(35, archer.x, archer.y - 42, 'Sceau de Leraje');
    this.flashCenter('Sceau de Leraje : archer lié');
  }

  private spawnLiving(kind: 'peasant' | 'guard', x: number, y: number): LivingUnit {
    const unit = new LivingUnit(this, x, y, kind);
    this.living.push(unit);
    return unit;
  }

  private spawnHauler(x: number, y: number): Hauler {
    const hauler = new Hauler(this, x, y);
    this.haulers.push(hauler);
    return hauler;
  }

  private killLiving(unit: LivingUnit, impulse: number): void {
    if (!unit.active) return;
    const bodyType: BodyType = unit.kind === 'guard' ? 'guard' : 'peasant';
    this.spawnCorpse(unit.x, unit.y, bodyType);
    unit.destroy();
    this.living = this.living.filter((other) => other !== unit);
    this.addScoreAt(unit.kind === 'guard' ? 25 : 10, unit.x, unit.y - 28, 'mort');
    if (impulse > 7) this.cameras.main.shake(70, 0.004);
  }

  private spawnCorpse(x: number, y: number, bodyType: BodyType): Corpse {
    const corpse = new Corpse(this, x, y, bodyType);
    this.corpses.push(corpse);
    return corpse;
  }

  private removeCorpse(corpse: Corpse): void {
    corpse.destroy();
    this.corpses = this.corpses.filter((other) => other !== corpse);
  }

  private checkWinLose(): void {
    if (this.state.status !== 'playing') return;
    const chapelAlive = this.buildings.some((building) => building.kind === 'chapel' && building.active);
    const barracksAlive = this.buildings.some((building) => building.kind === 'barracks' && building.active);
    if (this.state.resources.processed >= LEVELS[0].victoryProcessedBodies && !chapelAlive) {
      this.endGame('victory', 'Victoire : la chapelle est profanée et la fosse est nourrie.');
      return;
    }
    if (!chapelAlive && !barracksAlive) {
      this.endGame('victory', 'Victoire : le village tombe sous les sceaux.');
      return;
    }
    if (this.state.resources.purified >= 12) {
      this.endGame('defeat', 'Trop de corps ont été purifiés. Murmur se tait.');
    }
  }

  private endGame(status: 'victory' | 'defeat', message: string): void {
    this.state.status = status;
    this.centerText.setText(`${message}\nScore final : ${this.state.resources.score}\nR pour recommencer`);
    this.centerText.setColor(status === 'victory' ? '#9ddf7c' : '#d57a66');
  }

  private addScoreAt(base: number, x: number, y: number, label: string): void {
    const gained = this.state.addScore(base, this.time.now);
    this.flashText(`${label}  +${gained}`, x, y, '#f0c96a');
  }

  private flashText(text: string, x: number, y: number, color = '#efe9d4'): void {
    const label = this.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color
    }).setOrigin(0.5).setDepth(DEPTH.ui);
    this.tweens.add({
      targets: label,
      y: y - 28,
      alpha: 0,
      duration: 620,
      onComplete: () => label.destroy()
    });
  }

  private flashCenter(text: string): void {
    this.centerText.setText(text);
    this.time.delayedCall(1200, () => {
      if (this.state.status === 'playing') this.centerText.setText('');
    });
  }
}

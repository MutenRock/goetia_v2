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
  private objectiveText!: Phaser.GameObjects.Text;
  private centerText!: Phaser.GameObjects.Text;
  private pauseOverlay!: Phaser.GameObjects.Container;
  private helpOverlay!: Phaser.GameObjects.Container;
  private pointerWasRightDown = false;
  private shiftKey?: Phaser.Input.Keyboard.Key;
  private isPaused = false;
  private helpVisible = false;
  private houseSpawnTimerMs = BALANCE.buildings.houseSpawnCooldownMs;
  private barracksSpawnTimerMs = BALANCE.buildings.barracksSpawnCooldownMs;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.resetScene();
  }

  update(time: number, deltaMs: number): void {
    if (this.state.status !== 'playing') return;
    this.state.tick(time);
    const pointer = this.input.activePointer;
    this.hand.setPosition(pointer.x, pointer.y);
    this.hand.setClosed(this.grab.held !== null);

    if (this.isPaused) {
      this.updateHud();
      return;
    }

    const deltaSeconds = deltaMs / 1000;
    this.grab.updatePointer(pointer.x, pointer.y);
    this.soulExtraction.update(deltaMs);

    this.updateBuildings(time, deltaMs);
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
    this.isPaused = false;
    this.helpVisible = false;
    this.houseSpawnTimerMs = BALANCE.buildings.houseSpawnCooldownMs * 0.65;
    this.barracksSpawnTimerMs = BALANCE.buildings.barracksSpawnCooldownMs * 0.8;
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
    this.createOverlays();
    this.flashCenter('H : aide   |   P : pause   |   M : menu');
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
      if (this.state.status !== 'playing' || this.isPaused) return;
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
      if (this.state.status !== 'playing' || this.isPaused) return;
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
    this.input.keyboard?.on('keydown-M', () => this.scene.start('MenuScene'));
    this.input.keyboard?.on('keydown-H', () => this.toggleHelp());
    this.input.keyboard?.on('keydown-P', () => this.togglePause());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard?.on('keydown-ONE', () => {
      if (!this.isPaused) this.tryCraftHauler();
    });
    this.input.keyboard?.on('keydown-TWO', () => {
      if (!this.isPaused) this.tryCraftArcher();
    });
    this.input.keyboard?.on('keydown-E', () => {
      if (this.isPaused) return;
      const p = this.input.activePointer;
      this.extractAt(p.x, p.y);
    });
  }

  private createHud(): void {
    this.hud = this.add.text(14, 12, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#efe9d4',
      backgroundColor: '#100916cc',
      padding: { left: 8, right: 8, top: 6, bottom: 6 }
    }).setDepth(DEPTH.ui);

    this.objectiveText = this.add.text(WORLD.width - 14, 12, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#efe9d4',
      backgroundColor: '#100916cc',
      align: 'right',
      padding: { left: 8, right: 8, top: 6, bottom: 6 }
    }).setOrigin(1, 0).setDepth(DEPTH.ui);

    this.centerText = this.add.text(WORLD.width / 2, 72, '', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#efe9d4',
      align: 'center'
    }).setOrigin(0.5).setDepth(DEPTH.ui);

    this.updateHud();
  }

  private createOverlays(): void {
    this.pauseOverlay = this.createModal([
      'PAUSE',
      '',
      'P / Echap : reprendre',
      'H : aide',
      'R : recommencer',
      'M : retour menu'
    ], '#f0c96a');
    this.pauseOverlay.setVisible(false);

    this.helpOverlay = this.createModal([
      'COMMENT JOUER',
      '',
      'La main cree le chaos. La fosse transforme le chaos en armee.',
      '',
      'Clic gauche maintenu : saisir un vivant ou un cadavre.',
      'Relacher avec elan : jeter. Les impacts forts tuent et abiment les batiments.',
      'Clic droit / E : extirper l ame d un cadavre lumineux.',
      'Shift + clic : prioriser un cadavre extrait pour les porteurs.',
      '1 : creer un porteur de Bifrons avec 1 ame + 1 corps + stabilite.',
      '2 : creer un archer de Leraje avec 2 ames + 1 corps + stabilite.',
      '',
      'Les maisons font revenir des villageois.',
      'La caserne appelle des gardes.',
      'La chapelle purifie les cadavres dans son aura blanche.',
      '',
      'La stabilite baisse avec les rituels et les purifications.',
      'Les corps traites et les batiments profanes stabilisent la fosse.',
      '',
      'Objectif : detruire/profaner la chapelle et nourrir la fosse.',
      '',
      'H : fermer cette aide'
    ], '#9ddf7c');
    this.helpOverlay.setVisible(false);
  }

  private createModal(lines: string[], accent: string): Phaser.GameObjects.Container {
    const panel = this.add.container(WORLD.width / 2, WORLD.height / 2).setDepth(DEPTH.ui + 20);
    const bg = this.add.rectangle(0, 0, 760, 450, 0x100916, 0.94).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(accent).color, 0.9);
    const text = this.add.text(-340, -205, lines.join('\n'), {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#efe9d4',
      lineSpacing: 5
    });
    panel.add([bg, text]);
    return panel;
  }

  private updateHud(): void {
    const r = this.state.resources;
    const comboText = r.combo > 0 ? `   Combo: x${r.combo}` : '';
    this.hud.setText([
      'GOETIA v2 / Mortis Prototype',
      'H : aide   P/Echap : pause   M : menu   R : restart',
      'Clic gauche : attraper/jeter   Shift+clic : priorité cadavre',
      'Clic droit ou E : extirper âme   |   1 : Bifrons   |   2 : Leraje',
      `Score: ${r.score}${comboText}   Meilleur combo: x${r.maxCombo}`,
      `Âmes: ${r.souls}   Corps: ${r.bodies}   Traités: ${r.processed}   Purifiés: ${r.purified}`,
      `Stabilité: ${r.stability}/${BALANCE.stability.max} (${this.getStabilityLabel()})   Fosse HP: ${this.pit?.hp ?? 0}`,
      `Porteurs: ${this.haulers.filter((h) => h.active).length}   Archers: ${this.archers.filter((a) => a.active).length}`
    ]);

    this.objectiveText.setText(this.getObjectiveText());
  }

  private getObjectiveText(): string {
    const chapelAlive = this.buildings.some((building) => building.kind === 'chapel' && building.active);
    const barracksAlive = this.buildings.some((building) => building.kind === 'barracks' && building.active);
    const processedOk = this.state.resources.processed >= LEVELS[0].victoryProcessedBodies;
    const peasants = this.living.filter((unit) => unit.active && unit.kind === 'peasant').length;
    const guards = this.living.filter((unit) => unit.active && unit.kind === 'guard').length;
    return [
      'OBJECTIF',
      `${chapelAlive ? '[ ]' : '[x]'} Profaner la chapelle`,
      `${processedOk ? '[x]' : '[ ]'} Nourrir la fosse ${this.state.resources.processed}/${LEVELS[0].victoryProcessedBodies}`,
      `${barracksAlive ? '[ ]' : '[x]'} Briser la caserne`,
      `${this.pit.hp > 0 ? '[x]' : '[ ]'} Protéger la fosse`,
      `${this.state.resources.stability > 0 ? '[x]' : '[ ]'} Garder les sceaux stables`,
      '',
      `Villageois: ${peasants}/${BALANCE.buildings.maxPeasants}`,
      `Gardes: ${guards}/${BALANCE.buildings.maxGuards}`,
      `Purifiés: ${this.state.resources.purified}/12`
    ].join('\n');
  }

  private updateBuildings(timeMs: number, deltaMs: number): void {
    for (const building of this.buildings) {
      building.updateBuilding(timeMs);
    }
    this.updateBuildingSpawns(deltaMs);
  }

  private updateBuildingSpawns(deltaMs: number): void {
    const houses = this.buildings.filter((building) => building.kind === 'house' && building.active);
    const barracks = this.buildings.filter((building) => building.kind === 'barracks' && building.active);
    const peasantCount = this.living.filter((unit) => unit.active && unit.kind === 'peasant').length;
    const guardCount = this.living.filter((unit) => unit.active && unit.kind === 'guard').length;

    if (houses.length > 0 && peasantCount < BALANCE.buildings.maxPeasants) {
      this.houseSpawnTimerMs -= deltaMs;
      if (this.houseSpawnTimerMs <= 0) {
        const house = Phaser.Math.RND.pick(houses);
        const point = house.getSpawnPoint();
        this.spawnLiving('peasant', point.x, point.y);
        this.flashText('sort de maison', point.x, point.y - 42, '#efe9d4');
        this.houseSpawnTimerMs = BALANCE.buildings.houseSpawnCooldownMs + Phaser.Math.Between(-900, 900);
      }
    }

    if (barracks.length > 0 && guardCount < BALANCE.buildings.maxGuards) {
      this.barracksSpawnTimerMs -= deltaMs;
      if (this.barracksSpawnTimerMs <= 0) {
        const source = Phaser.Math.RND.pick(barracks);
        const point = source.getSpawnPoint();
        this.spawnLiving('guard', point.x, point.y);
        this.flashText('renfort', point.x, point.y - 42, '#d7d0b0');
        this.barracksSpawnTimerMs = BALANCE.buildings.barracksSpawnCooldownMs + Phaser.Math.Between(-1200, 1200);
      }
    }
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
        this.state.adjustStability(BALANCE.stability.bodyProcessedGain);
        this.addScoreAt(15, this.pit.x, this.pit.y - 90, '+1 corps stocké');
        this.flashText(`+${BALANCE.stability.bodyProcessedGain} stabilité`, this.pit.x, this.pit.y - 116, '#9ddf7c');
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
            this.state.adjustStability(-BALANCE.stability.purifiedDamage);
            this.flashText(`purifié  -${BALANCE.stability.purifiedDamage} stabilité`, corpse.x, corpse.y - 24, '#ffffff');
            this.warnLowStability(corpse.x, corpse.y - 54);
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
          const collapsed = building.damage(speed * BALANCE.living.impactBuildingDamageFactor);
          this.addScoreAt(20, building.x, building.y - building.bounds.height / 2, 'impact bâtiment');
          if (collapsed) {
            this.state.adjustStability(BALANCE.stability.buildingCollapseGain);
            this.addScoreAt(BALANCE.buildings.collapseScore[building.kind], building.x, building.y - building.bounds.height / 2 - 26, `${building.kind} détruit`);
            this.flashText(`+${BALANCE.stability.buildingCollapseGain} stabilité`, building.x, building.y - building.bounds.height / 2 - 52, '#9ddf7c');
            this.cameras.main.shake(180, 0.009);
          }
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
    this.state.adjustStability(-BALANCE.stability.extractCost);
    this.hand.pulseExtraction();
    this.addScoreAt(corpse.bodyType === 'guard' ? 20 : 10, corpse.x, corpse.y - 42, corpse.bodyType === 'guard' ? '+2 âmes' : '+1 âme');
    this.warnLowStability(corpse.x, corpse.y - 72);
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

  private togglePause(): void {
    if (this.state.status !== 'playing') return;
    if (this.helpVisible) {
      this.toggleHelp();
      return;
    }
    this.isPaused = !this.isPaused;
    this.pauseOverlay.setVisible(this.isPaused);
  }

  private toggleHelp(): void {
    if (this.state.status !== 'playing') return;
    this.helpVisible = !this.helpVisible;
    this.isPaused = this.helpVisible;
    this.helpOverlay.setVisible(this.helpVisible);
    this.pauseOverlay.setVisible(false);
  }

  private tryCraftHauler(): void {
    if (!this.state.canPay(BALANCE.pit.haulerCost)) {
      this.flashCenter('Pas assez de ressources pour Bifrons');
      return;
    }
    if (!this.state.canSpendStability(BALANCE.stability.haulerCost)) {
      this.flashCenter('Sceaux trop instables pour Bifrons');
      return;
    }
    this.state.pay(BALANCE.pit.haulerCost);
    this.state.spendStability(BALANCE.stability.haulerCost);
    this.spawnHauler(this.pit.x - 52, WORLD.groundY - 18);
    this.addScoreAt(25, this.pit.x - 52, WORLD.groundY - 70, 'Sceau de Bifrons');
    this.flashCenter(`Sceau de Bifrons : -${BALANCE.stability.haulerCost} stabilité`);
    this.warnLowStability(this.pit.x - 52, WORLD.groundY - 96);
  }

  private tryCraftArcher(): void {
    if (!this.state.canPay(BALANCE.pit.archerCost)) {
      this.flashCenter('Pas assez de ressources pour Leraje');
      return;
    }
    if (!this.state.canSpendStability(BALANCE.stability.archerCost)) {
      this.flashCenter('Sceaux trop instables pour Leraje');
      return;
    }
    this.state.pay(BALANCE.pit.archerCost);
    this.state.spendStability(BALANCE.stability.archerCost);
    const archer = new Archer(this, this.pit.x - 112 - this.archers.length * 16, WORLD.groundY - 20);
    this.archers.push(archer);
    this.addScoreAt(35, archer.x, archer.y - 42, 'Sceau de Leraje');
    this.flashCenter(`Sceau de Leraje : -${BALANCE.stability.archerCost} stabilité`);
    this.warnLowStability(archer.x, archer.y - 72);
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
    if (this.state.resources.stability <= BALANCE.stability.min) {
      this.endGame('defeat', 'Les sceaux sont instables. La fosse se referme.');
      return;
    }
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
    this.pauseOverlay?.setVisible(false);
    this.helpOverlay?.setVisible(false);
    this.centerText.setText(`${message}\nScore final : ${this.state.resources.score}\nStabilité finale : ${this.state.resources.stability}\nR pour recommencer   |   M pour menu`);
    this.centerText.setColor(status === 'victory' ? '#9ddf7c' : '#d57a66');
  }

  private addScoreAt(base: number, x: number, y: number, label: string): void {
    const gained = this.state.addScore(base, this.time.now);
    this.flashText(`${label}  +${gained}`, x, y, '#f0c96a');
  }

  private getStabilityLabel(): string {
    const stability = this.state.resources.stability;
    if (stability <= BALANCE.stability.criticalThreshold) return 'CRITIQUE';
    if (stability <= BALANCE.stability.lowThreshold) return 'INSTABLE';
    return 'stable';
  }

  private warnLowStability(x: number, y: number): void {
    const stability = this.state.resources.stability;
    if (stability <= BALANCE.stability.criticalThreshold) {
      this.flashText('sceaux critiques', x, y, '#d57a66');
    } else if (stability <= BALANCE.stability.lowThreshold) {
      this.flashText('sceaux instables', x, y, '#f0c96a');
    }
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
      if (this.state.status === 'playing' && !this.isPaused) this.centerText.setText('');
    });
  }
}

import Phaser from 'phaser';
import { WORLD, DEPTH } from '../core/constants';
import { openBugReportMail } from '../core/bugReport';
import { GAME_VERSION } from '../core/version';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.createBackground();
    this.createTitleCard();
    this.createInput();
  }

  private createBackground(): void {
    this.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 0x100916).setDepth(DEPTH.background);
    this.add.rectangle(WORLD.width / 2, WORLD.groundY + 40, WORLD.width, 120, 0x211522).setDepth(1);
    this.add.rectangle(WORLD.width / 2, WORLD.groundY, WORLD.width, 6, 0x5b4255).setDepth(2);

    for (let i = 0; i < 9; i++) {
      const x = 90 + i * 96;
      this.add.triangle(x, WORLD.groundY - 8, -28, 0, 28, 0, 0, -70 - (i % 3) * 26, 0x0b0710, 0.85).setDepth(2);
    }

    this.add.ellipse(820, WORLD.groundY - 32, 112, 32, 0x000000, 0.45).setDepth(2);
    this.add.star(820, WORLD.groundY - 58, 5, 18, 42, 0x9ddf7c, 0.7).setDepth(3);
    this.add.text(820, WORLD.groundY - 10, 'FOSSE', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#9ddf7c'
    }).setOrigin(0.5).setDepth(4);
  }

  private createTitleCard(): void {
    this.add.text(WORLD.width / 2, 70, 'GOETIA', {
      fontFamily: 'monospace',
      fontSize: '62px',
      color: '#efe9d4'
    }).setOrigin(0.5).setDepth(DEPTH.ui);

    this.add.text(WORLD.width / 2, 124, `Mortis Prototype — ${GAME_VERSION}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#a266c7'
    }).setOrigin(0.5).setDepth(DEPTH.ui);

    const card = this.add.rectangle(WORLD.width / 2, 272, 740, 280, 0x160d1f, 0.88)
      .setStrokeStyle(2, 0xa266c7, 0.85)
      .setDepth(DEPTH.ui - 1);

    const text = [
      'Version playtest : objectif = finir 3 vagues et remonter les bugs.',
      '',
      'But : nourrir la fosse sans laisser la chapelle purifier les corps.',
      '',
      '1. Attrape et jette les vivants pour creer des cadavres.',
      '2. Extirpe les ames avec Murmur.',
      '3. Priorise les corps importants.',
      '4. Les porteurs de Bifrons les ramenent a la fosse.',
      '5. Entre deux vagues, choisis un sceau pour ameliorer la run.',
      '',
      'ENTREE / ESPACE : commencer     B : signaler un bug'
    ].join('\n');

    this.add.text(card.x - 340, card.y - 124, text, {
      fontFamily: 'monospace',
      fontSize: '15px',
      color: '#efe9d4',
      lineSpacing: 5
    }).setDepth(DEPTH.ui);

    this.createMenuButton(WORLD.width / 2 - 170, 446, '▶ JOUER', () => this.scene.start('GameScene'), '#9ddf7c');
    this.createMenuButton(WORLD.width / 2 + 170, 446, '✉ BUG REPORT', () => this.reportBug(), '#f0c96a');

    this.add.text(WORLD.width / 2, 500, 'Le bouton bug ouvre ton client mail avec un rapport prérempli vers pierreh@sterenna.fr.', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#8f86a0'
    }).setOrigin(0.5).setDepth(DEPTH.ui);
  }

  private createMenuButton(x: number, y: number, label: string, onClick: () => void, color: string): void {
    const text = this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color,
      backgroundColor: '#100916cc',
      padding: { left: 16, right: 16, top: 9, bottom: 9 }
    }).setOrigin(0.5).setDepth(DEPTH.ui).setInteractive({ useHandCursor: true });

    text.on('pointerover', () => text.setScale(1.05));
    text.on('pointerout', () => text.setScale(1));
    text.on('pointerdown', () => onClick());
  }

  private createInput(): void {
    this.input.keyboard?.on('keydown-ENTER', () => this.scene.start('GameScene'));
    this.input.keyboard?.on('keydown-SPACE', () => this.scene.start('GameScene'));
    this.input.keyboard?.on('keydown-B', () => this.reportBug());
  }

  private reportBug(): void {
    openBugReportMail({ scene: 'MenuScene', status: 'main-menu' });
  }
}

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    this.createGeneratedTextures();
    this.scene.start('GameScene');
  }

  private createGeneratedTextures(): void {
    this.makeUnitTexture('peasant', 0xd6b07a, 0x3b2430);
    this.makeUnitTexture('guard', 0x9ea2a9, 0x3b2430, true);
    this.makeUnitTexture('hauler', 0x6a3d86, 0x9ddf7c);
    this.makeUnitTexture('archer', 0x445c35, 0x9ddf7c, true);
    this.makeCorpseTexture('corpse-peasant', 0x8c6548);
    this.makeCorpseTexture('corpse-guard', 0x777d84);
    this.makeCorpseTexture('corpse-priest', 0xd7d0b0);
  }

  private makeUnitTexture(key: string, fill: number, stroke: number, armed = false): void {
    const g = this.add.graphics();
    g.clear();
    g.fillStyle(fill, 1);
    g.lineStyle(2, stroke, 1);
    g.fillCircle(16, 10, 7);
    g.strokeCircle(16, 10, 7);
    g.fillRoundedRect(8, 18, 16, 24, 5);
    g.strokeRoundedRect(8, 18, 16, 24, 5);
    g.lineBetween(9, 28, 2, 38);
    g.lineBetween(23, 28, 30, 38);
    g.lineBetween(11, 41, 7, 51);
    g.lineBetween(21, 41, 25, 51);
    if (armed) {
      g.lineStyle(3, 0x1f1326, 1);
      g.lineBetween(28, 18, 35, 0);
    }
    g.generateTexture(key, 40, 56);
    g.destroy();
  }

  private makeCorpseTexture(key: string, fill: number): void {
    const g = this.add.graphics();
    g.fillStyle(fill, 1);
    g.lineStyle(2, 0x1f1326, 1);
    g.fillEllipse(18, 16, 34, 12);
    g.strokeEllipse(18, 16, 34, 12);
    g.fillCircle(33, 13, 5);
    g.strokeCircle(33, 13, 5);
    g.generateTexture(key, 42, 30);
    g.destroy();
  }
}

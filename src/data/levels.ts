import type { BuildingKind } from '../core/types';

export interface BuildingSpawn {
  kind: BuildingKind;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
}

export interface LevelDefinition {
  id: string;
  name: string;
  buildings: BuildingSpawn[];
  peasants: number;
  guards: number;
  victoryProcessedBodies: number;
}

export const LEVELS: LevelDefinition[] = [
  {
    id: 'hamlet_01',
    name: 'Le Hameau de la première fosse',
    peasants: 12,
    guards: 3,
    victoryProcessedBodies: 12,
    buildings: [
      { kind: 'house', x: 130, y: 408, width: 86, height: 96, hp: 100 },
      { kind: 'house', x: 285, y: 415, width: 98, height: 88, hp: 120 },
      { kind: 'chapel', x: 485, y: 390, width: 112, height: 132, hp: 170 },
      { kind: 'barracks', x: 670, y: 405, width: 128, height: 102, hp: 190 }
    ]
  }
];

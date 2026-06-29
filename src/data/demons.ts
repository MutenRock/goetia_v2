import type { DemonId } from '../core/types';

export interface DemonDefinition {
  id: DemonId;
  name: string;
  rank: string;
  tier: 1 | 2 | 3 | 4;
  legions: number;
  role: string;
  sigil: string;
  designUse: string;
  unlocks: string[];
}

export const DEMONS: Record<DemonId, DemonDefinition> = {
  murmur: {
    id: 'murmur',
    name: 'Murmur',
    rank: 'Duc / Comte',
    tier: 1,
    legions: 30,
    role: 'Soul Extractor',
    sigil: 'sigil_murmur.png',
    designUse: 'Extirpe les âmes des cadavres. Pouvoir tutoriel central.',
    unlocks: ['basic_soul_extraction', 'area_extraction']
  },
  bifrons: {
    id: 'bifrons',
    name: 'Bifrons',
    rank: 'Comte',
    tier: 1,
    legions: 6,
    role: 'Hauler',
    sigil: 'sigil_bifrons.png',
    designUse: 'Transport logistique des cadavres vers la fosse.',
    unlocks: ['corpse_hauler', 'double_carry']
  },
  leraje: {
    id: 'leraje',
    name: 'Leraje',
    rank: 'Marquis',
    tier: 1,
    legions: 30,
    role: 'Combat / Archer',
    sigil: 'sigil_leraje.png',
    designUse: 'Première unité défensive à distance, applique une gangrène lente.',
    unlocks: ['bone_archer', 'decay_arrow']
  },
  andras: {
    id: 'andras',
    name: 'Andras',
    rank: 'Marquis',
    tier: 2,
    legions: 30,
    role: 'Combat / Berserker',
    sigil: 'sigil_andras.png',
    designUse: 'Unité puissante mais instable, friendly fire si stabilité basse.',
    unlocks: ['berserker', 'ritual_instability']
  },
  malthus: {
    id: 'malthus',
    name: 'Malthus',
    rank: 'Comte',
    tier: 1,
    legions: 26,
    role: 'Builder',
    sigil: 'sigil_malthus.png',
    designUse: 'Construction et réparation de structures de fosse.',
    unlocks: ['bone_tower', 'pit_repair']
  },
  buer: {
    id: 'buer',
    name: 'Buer',
    rank: 'Président',
    tier: 2,
    legions: 50,
    role: 'Support / Healer',
    sigil: 'sigil_buer.png',
    designUse: 'Stabilise les serviteurs et restaure la fosse.',
    unlocks: ['horde_heal', 'stability_recovery']
  }
};

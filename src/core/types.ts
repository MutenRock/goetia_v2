export type BodyType = 'peasant' | 'guard' | 'priest';
export type LivingKind = 'peasant' | 'guard';
export type BuildingKind = 'house' | 'chapel' | 'barracks' | 'barn';
export type DemonId = 'murmur' | 'bifrons' | 'leraje' | 'andras' | 'malthus' | 'buer';

export interface Resources {
  souls: number;
  bodies: number;
  stability: number;
  purified: number;
  processed: number;
  score: number;
  combo: number;
  maxCombo: number;
}

export interface Cost {
  souls: number;
  bodies: number;
}

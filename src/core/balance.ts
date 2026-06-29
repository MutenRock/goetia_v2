export const BALANCE = {
  hand: {
    grabRadius: 36,
    throwMultiplier: 7.5,
    maxThrowSpeed: 980,
    extractRange: 66,
    extractCooldownMs: 260
  },
  living: {
    peasantHp: 12,
    guardHp: 34,
    impactKillSpeed: 420,
    impactBuildingDamageFactor: 0.08
  },
  corpse: {
    freshnessMax: 100,
    decayPerSecond: 1.8,
    purifyPerSecond: 12
  },
  hauler: {
    hp: 22,
    speed: 64,
    carrySpeed: 44,
    scanRadius: 999
  },
  archer: {
    hp: 24,
    range: 260,
    cooldownMs: 1100,
    damage: 10,
    projectileSpeed: 360
  },
  guard: {
    speed: 40,
    attackRange: 32,
    attackDamage: 6,
    attackCooldownMs: 900
  },
  buildings: {
    houseSpawnCooldownMs: 5200,
    barracksSpawnCooldownMs: 7600,
    maxPeasants: 18,
    maxGuards: 6,
    collapseScore: {
      house: 60,
      chapel: 260,
      barracks: 180,
      barn: 90
    }
  },
  stability: {
    start: 100,
    min: 0,
    max: 100,
    extractCost: 1,
    haulerCost: 4,
    archerCost: 7,
    purifiedDamage: 6,
    bodyProcessedGain: 2,
    buildingCollapseGain: 8,
    lowThreshold: 35,
    criticalThreshold: 15
  },
  pit: {
    hp: 260,
    startSouls: 0,
    startBodies: 0,
    haulerCost: { souls: 1, bodies: 1 },
    archerCost: { souls: 2, bodies: 1 },
    startHaulers: 2
  }
} as const;

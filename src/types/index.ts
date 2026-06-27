export type Habitat = 'forest' | 'meadow' | 'water' | 'urban' | 'mountain' | 'wetland';
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
export type AnimalCategory = 'bird' | 'mammal' | 'reptile' | 'amphibian' | 'insect' | 'fish';

export interface Animal {
  id: string;
  name: string;
  scientificName: string;
  category: AnimalCategory;
  description: string;
  habitat: Habitat[];
  rarity: Rarity;
  activeTime: TimeOfDay[];
  seasons: Season[];
  minAltitude: number;
  maxAltitude: number;
  emoji: string;
  silhouette: string;
  funFact: string;
  xpReward: number;
  size: string;
  diet: string;
  color: string;
}

export interface DiscoveredAnimal {
  animalId: string;
  firstSeen: string;
  timesSeen: number;
  lastSeen: string;
  locations: { latitude: number; longitude: number }[];
}

export interface SpawnedAnimal {
  id: string;
  animal: Animal;
  latitude: number;
  longitude: number;
  spawnTime: number;
  despawnTime: number;
  caught: boolean;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalDiscovered: number;
  totalEncounters: number;
  startDate: string;
  achievements: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'discover' | 'encounter' | 'category' | 'rarity';
  categoryFilter?: AnimalCategory;
  rarityFilter?: Rarity;
}

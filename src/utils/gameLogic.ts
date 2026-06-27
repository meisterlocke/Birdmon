import { PlayerProfile, DiscoveredAnimal, Animal, AnimalCategory, Rarity } from '../types';
import { achievements } from '../data/achievements';
import { animals } from '../data/animals';

export function calculateLevel(xp: number): { level: number; xpToNextLevel: number } {
  let level = 1;
  let xpNeeded = 100;
  let totalXpForLevel = 0;

  while (xp >= totalXpForLevel + xpNeeded) {
    totalXpForLevel += xpNeeded;
    level++;
    xpNeeded = Math.floor(100 * Math.pow(1.3, level - 1));
  }

  return { level, xpToNextLevel: totalXpForLevel + xpNeeded - xp };
}

export function createNewProfile(name: string): PlayerProfile {
  return {
    name,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalDiscovered: 0,
    totalEncounters: 0,
    startDate: new Date().toISOString(),
    achievements: [],
  };
}

export function processEncounter(
  profile: PlayerProfile,
  animal: Animal,
  discovered: Record<string, DiscoveredAnimal>,
  latitude: number,
  longitude: number
): {
  profile: PlayerProfile;
  discovered: Record<string, DiscoveredAnimal>;
  isNewDiscovery: boolean;
  newAchievements: string[];
  xpGained: number;
} {
  const isNewDiscovery = !discovered[animal.id];
  let xpGained = animal.xpReward;
  if (isNewDiscovery) xpGained *= 2;

  const newDiscovered = { ...discovered };
  if (isNewDiscovery) {
    newDiscovered[animal.id] = {
      animalId: animal.id,
      firstSeen: new Date().toISOString(),
      timesSeen: 1,
      lastSeen: new Date().toISOString(),
      locations: [{ latitude, longitude }],
    };
  } else {
    const existing = { ...newDiscovered[animal.id] };
    existing.timesSeen += 1;
    existing.lastSeen = new Date().toISOString();
    existing.locations = [
      ...existing.locations.slice(-9),
      { latitude, longitude },
    ];
    newDiscovered[animal.id] = existing;
  }

  const newXp = profile.xp + xpGained;
  const { level, xpToNextLevel } = calculateLevel(newXp);

  const newProfile: PlayerProfile = {
    ...profile,
    xp: newXp,
    level,
    xpToNextLevel,
    totalDiscovered: Object.keys(newDiscovered).length,
    totalEncounters: profile.totalEncounters + 1,
  };

  const newAchievements = checkAchievements(newProfile, newDiscovered, profile.achievements);

  newProfile.achievements = [...new Set([...profile.achievements, ...newAchievements])];

  return {
    profile: newProfile,
    discovered: newDiscovered,
    isNewDiscovery,
    newAchievements: newAchievements.filter(a => !profile.achievements.includes(a)),
    xpGained,
  };
}

function checkAchievements(
  profile: PlayerProfile,
  discovered: Record<string, DiscoveredAnimal>,
  existing: string[]
): string[] {
  const earned: string[] = [...existing];
  const discoveredAnimals = Object.keys(discovered).map(id => animals.find(a => a.id === id)!).filter(Boolean);

  for (const achievement of achievements) {
    if (earned.includes(achievement.id)) continue;

    let met = false;
    switch (achievement.type) {
      case 'discover':
        met = Object.keys(discovered).length >= achievement.requirement;
        break;
      case 'encounter':
        met = profile.totalEncounters >= achievement.requirement;
        break;
      case 'category':
        met = discoveredAnimals.filter(a => a.category === achievement.categoryFilter).length >= achievement.requirement;
        break;
      case 'rarity':
        met = discoveredAnimals.some(a => a.rarity === achievement.rarityFilter);
        break;
    }

    if (met) earned.push(achievement.id);
  }

  return earned;
}

export function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'common': return '#78C850';
    case 'uncommon': return '#4A90D9';
    case 'rare': return '#A855F7';
    case 'very_rare': return '#F59E0B';
    case 'legendary': return '#EF4444';
  }
}

export function getRarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case 'common': return 'Häufig';
    case 'uncommon': return 'Ungewöhnlich';
    case 'rare': return 'Selten';
    case 'very_rare': return 'Sehr selten';
    case 'legendary': return 'Legendär';
  }
}

export function getCategoryLabel(category: AnimalCategory): string {
  switch (category) {
    case 'bird': return 'Vogel';
    case 'mammal': return 'Säugetier';
    case 'reptile': return 'Reptil';
    case 'amphibian': return 'Amphibie';
    case 'insect': return 'Insekt';
    case 'fish': return 'Fisch';
  }
}

export function getCategoryEmoji(category: AnimalCategory): string {
  switch (category) {
    case 'bird': return '🐦';
    case 'mammal': return '🐾';
    case 'reptile': return '🦎';
    case 'amphibian': return '🐸';
    case 'insect': return '🦋';
    case 'fish': return '🐟';
  }
}

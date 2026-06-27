import { Animal, SpawnedAnimal, Habitat, TimeOfDay, Season } from '../types';
import { animals } from '../data/animals';

function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 18) return 'day';
  if (hour >= 18 && hour < 21) return 'dusk';
  return 'night';
}

function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getHabitatFromLocation(latitude: number, longitude: number): Habitat[] {
  const seed = Math.sin(latitude * 1000 + longitude * 1000) * 10000;
  const val = Math.abs(seed - Math.floor(seed));

  const habitats: Habitat[] = [];

  if (val < 0.3) habitats.push('forest');
  if (val > 0.2 && val < 0.5) habitats.push('meadow');
  if (val > 0.4 && val < 0.65) habitats.push('water');
  if (val > 0.6 && val < 0.8) habitats.push('urban');
  if (val > 0.75 && val < 0.9) habitats.push('wetland');
  if (val > 0.85) habitats.push('mountain');

  if (habitats.length === 0) habitats.push('urban', 'meadow');

  return habitats;
}

function getRarityWeight(rarity: string): number {
  switch (rarity) {
    case 'common': return 40;
    case 'uncommon': return 25;
    case 'rare': return 8;
    case 'very_rare': return 3;
    case 'legendary': return 1;
    default: return 10;
  }
}

function weightedRandom(candidates: Animal[]): Animal {
  const totalWeight = candidates.reduce((sum, a) => sum + getRarityWeight(a.rarity), 0);
  let random = Math.random() * totalWeight;

  for (const animal of candidates) {
    random -= getRarityWeight(animal.rarity);
    if (random <= 0) return animal;
  }

  return candidates[candidates.length - 1];
}

function randomOffset(center: number, maxOffsetDeg: number): number {
  return center + (Math.random() - 0.5) * 2 * maxOffsetDeg;
}

export function generateSpawns(
  latitude: number,
  longitude: number,
  existingSpawns: SpawnedAnimal[],
  maxSpawns: number = 8
): SpawnedAnimal[] {
  const aliveSpawns = existingSpawns.filter(s => s.despawnTime > Date.now() && !s.caught);

  if (aliveSpawns.length >= maxSpawns) return aliveSpawns;

  const timeOfDay = getCurrentTimeOfDay();
  const season = getCurrentSeason();
  const habitats = getHabitatFromLocation(latitude, longitude);

  const candidates = animals.filter(animal => {
    const habitatMatch = animal.habitat.some(h => habitats.includes(h));
    const timeMatch = animal.activeTime.includes(timeOfDay);
    const seasonMatch = animal.seasons.includes(season);
    return habitatMatch && timeMatch && seasonMatch;
  });

  if (candidates.length === 0) return aliveSpawns;

  const numToSpawn = Math.min(
    maxSpawns - aliveSpawns.length,
    Math.floor(Math.random() * 3) + 1
  );

  const newSpawns: SpawnedAnimal[] = [];

  for (let i = 0; i < numToSpawn; i++) {
    const animal = weightedRandom(candidates);
    const spawnLat = randomOffset(latitude, 0.003);
    const spawnLng = randomOffset(longitude, 0.003);

    const lifetimeMinutes = animal.rarity === 'legendary' ? 5 :
      animal.rarity === 'very_rare' ? 8 :
      animal.rarity === 'rare' ? 12 :
      animal.rarity === 'uncommon' ? 15 : 20;

    newSpawns.push({
      id: `${animal.id}_${Date.now()}_${i}`,
      animal,
      latitude: spawnLat,
      longitude: spawnLng,
      spawnTime: Date.now(),
      despawnTime: Date.now() + lifetimeMinutes * 60 * 1000,
      caught: false,
    });
  }

  return [...aliveSpawns, ...newSpawns];
}

export function getDistanceMeters(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerProfile, DiscoveredAnimal, SpawnedAnimal, Animal } from '../types';
import { createNewProfile, processEncounter } from '../utils/gameLogic';
import { generateSpawns } from '../utils/spawning';

interface GameState {
  profile: PlayerProfile;
  discovered: Record<string, DiscoveredAnimal>;
  spawns: SpawnedAnimal[];
  isLoaded: boolean;
  latitude: number;
  longitude: number;
}

interface GameContextType extends GameState {
  updateLocation: (lat: number, lng: number) => void;
  catchAnimal: (spawn: SpawnedAnimal) => Promise<{
    isNewDiscovery: boolean;
    newAchievements: string[];
    xpGained: number;
  }>;
  refreshSpawns: () => void;
  resetGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

const STORAGE_KEYS = {
  PROFILE: 'birdmon_profile',
  DISCOVERED: 'birdmon_discovered',
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    profile: createNewProfile('Naturentdecker'),
    discovered: {},
    spawns: [],
    isLoaded: false,
    latitude: 48.1351,
    longitude: 11.5820,
  });

  const spawnIntervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    loadSavedData();
  }, []);

  useEffect(() => {
    if (!state.isLoaded) return;

    spawnIntervalRef.current = setInterval(() => {
      refreshSpawns();
    }, 30000);

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    };
  }, [state.isLoaded, state.latitude, state.longitude]);

  async function loadSavedData() {
    try {
      const [profileJson, discoveredJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.DISCOVERED),
      ]);

      const profile = profileJson ? JSON.parse(profileJson) : createNewProfile('Naturentdecker');
      const discovered = discoveredJson ? JSON.parse(discoveredJson) : {};

      setState(prev => ({
        ...prev,
        profile,
        discovered,
        isLoaded: true,
      }));
    } catch {
      setState(prev => ({ ...prev, isLoaded: true }));
    }
  }

  async function saveData(profile: PlayerProfile, discovered: Record<string, DiscoveredAnimal>) {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)),
        AsyncStorage.setItem(STORAGE_KEYS.DISCOVERED, JSON.stringify(discovered)),
      ]);
    } catch {
      // Silent fail
    }
  }

  const updateLocation = useCallback((lat: number, lng: number) => {
    setState(prev => {
      const newSpawns = generateSpawns(lat, lng, prev.spawns);
      return { ...prev, latitude: lat, longitude: lng, spawns: newSpawns };
    });
  }, []);

  const refreshSpawns = useCallback(() => {
    setState(prev => {
      const newSpawns = generateSpawns(prev.latitude, prev.longitude, prev.spawns);
      return { ...prev, spawns: newSpawns };
    });
  }, []);

  const catchAnimal = useCallback(async (spawn: SpawnedAnimal) => {
    return new Promise<{
      isNewDiscovery: boolean;
      newAchievements: string[];
      xpGained: number;
    }>((resolve) => {
      setState(prev => {
        const result = processEncounter(
          prev.profile,
          spawn.animal,
          prev.discovered,
          spawn.latitude,
          spawn.longitude
        );

        const updatedSpawns = prev.spawns.map(s =>
          s.id === spawn.id ? { ...s, caught: true } : s
        );

        saveData(result.profile, result.discovered);

        resolve({
          isNewDiscovery: result.isNewDiscovery,
          newAchievements: result.newAchievements,
          xpGained: result.xpGained,
        });

        return {
          ...prev,
          profile: result.profile,
          discovered: result.discovered,
          spawns: updatedSpawns,
        };
      });
    });
  }, []);

  const resetGame = useCallback(async () => {
    const newProfile = createNewProfile('Naturentdecker');
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.PROFILE),
      AsyncStorage.removeItem(STORAGE_KEYS.DISCOVERED),
    ]);
    setState(prev => ({
      ...prev,
      profile: newProfile,
      discovered: {},
      spawns: [],
    }));
  }, []);

  return (
    <GameContext.Provider value={{
      ...state,
      updateLocation,
      catchAnimal,
      refreshSpawns,
      resetGame,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}

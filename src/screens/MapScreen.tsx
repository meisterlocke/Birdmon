import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useGame } from '../context/GameContext';
import { SpawnedAnimal } from '../types';
import { EncounterModal } from '../components/EncounterModal';
import { getDistanceMeters } from '../utils/spawning';
import { getRarityColor, getRarityLabel } from '../utils/gameLogic';
import { colors, spacing, borderRadius, fontSize } from '../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_SIZE = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT);

export function MapScreen() {
  const { profile, spawns, latitude, longitude, updateLocation, catchAnimal, refreshSpawns } = useGame();
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedSpawn, setSelectedSpawn] = useState<SpawnedAnimal | null>(null);
  const [showEncounter, setShowEncounter] = useState(false);
  const [catchResult, setCatchResult] = useState<any>(null);
  const [compassHeading, setCompassHeading] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    requestPermissions();
    startPulseAnimation();
  }, []);

  function startPulseAnimation() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }

  async function requestPermissions() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      setHasPermission(true);
      startLocationTracking();
    } else {
      Alert.alert(
        'Standort benötigt',
        'Birdmon braucht deinen Standort, um Tiere in deiner Umgebung zu finden.',
        [{ text: 'OK' }]
      );
    }
  }

  async function startLocationTracking() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      updateLocation(location.coords.latitude, location.coords.longitude);

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (loc) => {
          updateLocation(loc.coords.latitude, loc.coords.longitude);
        }
      );
    } catch {
      updateLocation(48.1351, 11.5820);
    }
  }

  function handleSpawnPress(spawn: SpawnedAnimal) {
    const distance = getDistanceMeters(latitude, longitude, spawn.latitude, spawn.longitude);
    if (distance > 500) {
      Alert.alert('Zu weit weg', `Das Tier ist ${Math.round(distance)}m entfernt. Gehe näher heran!`);
      return;
    }
    setSelectedSpawn(spawn);
    setCatchResult(null);
    setShowEncounter(true);
  }

  async function handleCatch() {
    if (!selectedSpawn) return;
    const result = await catchAnimal(selectedSpawn);
    setCatchResult(result);
  }

  function handleCloseEncounter() {
    setShowEncounter(false);
    setSelectedSpawn(null);
    setCatchResult(null);
  }

  function getSpawnPosition(spawn: SpawnedAnimal) {
    const latDiff = spawn.latitude - latitude;
    const lngDiff = spawn.longitude - longitude;
    const scale = 80000;
    return {
      x: SCREEN_WIDTH / 2 + lngDiff * scale,
      y: SCREEN_HEIGHT / 2 - latDiff * scale,
    };
  }

  const xpProgress = profile.xpToNextLevel > 0
    ? 1 - (profile.xpToNextLevel / (profile.xp + profile.xpToNextLevel))
    : 0;

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <View style={styles.mapContainer}>
        {/* Grid lines for "map feel" */}
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`h${i}`}
            style={[
              styles.gridLine,
              {
                top: (i / 20) * SCREEN_HEIGHT,
                width: '100%',
                height: 1,
              },
            ]}
          />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`v${i}`}
            style={[
              styles.gridLine,
              {
                left: (i / 20) * SCREEN_WIDTH,
                height: '100%',
                width: 1,
              },
            ]}
          />
        ))}

        {/* Spawned animals */}
        {spawns
          .filter(s => !s.caught && s.despawnTime > Date.now())
          .map(spawn => {
            const pos = getSpawnPosition(spawn);
            const distance = getDistanceMeters(latitude, longitude, spawn.latitude, spawn.longitude);
            const isInRange = distance <= 500;
            const rarityColor = getRarityColor(spawn.animal.rarity);

            if (pos.x < -50 || pos.x > SCREEN_WIDTH + 50 || pos.y < -50 || pos.y > SCREEN_HEIGHT + 50) {
              return null;
            }

            return (
              <TouchableOpacity
                key={spawn.id}
                style={[
                  styles.spawnMarker,
                  {
                    left: pos.x - 30,
                    top: pos.y - 30,
                    opacity: isInRange ? 1 : 0.5,
                  },
                ]}
                onPress={() => handleSpawnPress(spawn)}
                activeOpacity={0.7}
              >
                <View style={[styles.markerCircle, { borderColor: rarityColor }]}>
                  <Text style={styles.markerEmoji}>{spawn.animal.emoji}</Text>
                </View>
                <View style={[styles.markerLabel, { backgroundColor: rarityColor }]}>
                  <Text style={styles.markerName} numberOfLines={1}>
                    {spawn.animal.name}
                  </Text>
                </View>
                <Text style={styles.distanceText}>{Math.round(distance)}m</Text>
              </TouchableOpacity>
            );
          })}

        {/* Player marker */}
        <View style={styles.playerContainer}>
          <Animated.View
            style={[
              styles.playerPulse,
              { transform: [{ scale: pulseAnim }], opacity: pulseAnim.interpolate({
                inputRange: [1, 1.5],
                outputRange: [0.3, 0],
              })},
            ]}
          />
          <View style={styles.playerDot}>
            <Text style={styles.playerEmoji}>🧭</Text>
          </View>
        </View>
      </View>

      {/* Top HUD */}
      <View style={styles.hud}>
        <View style={styles.hudCard}>
          <Text style={styles.hudLevel}>Lv. {profile.level}</Text>
          <View style={styles.xpBarContainer}>
            <View style={[styles.xpBar, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.xpText}>{profile.xp} XP</Text>
        </View>
        <View style={styles.hudCard}>
          <Text style={styles.hudStat}>📋 {profile.totalDiscovered}</Text>
          <Text style={styles.hudStatLabel}>Arten</Text>
        </View>
      </View>

      {/* Refresh button */}
      <TouchableOpacity style={styles.refreshButton} onPress={refreshSpawns}>
        <Text style={styles.refreshIcon}>🔄</Text>
      </TouchableOpacity>

      {/* Compass */}
      <View style={styles.compass}>
        <Text style={styles.compassText}>N</Text>
        <Text style={styles.coordText}>
          {latitude.toFixed(4)}°N {longitude.toFixed(4)}°E
        </Text>
      </View>

      {/* Encounter Modal */}
      <EncounterModal
        spawn={selectedSpawn}
        visible={showEncounter}
        onCatch={handleCatch}
        onClose={handleCloseEncounter}
        catchResult={catchResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(45, 106, 79, 0.06)',
  },
  playerContainer: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 25,
    top: SCREEN_HEIGHT / 2 - 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
  },
  playerDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playerEmoji: {
    fontSize: 22,
  },
  spawnMarker: {
    position: 'absolute',
    alignItems: 'center',
    width: 60,
  },
  markerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  markerEmoji: {
    fontSize: 22,
  },
  markerLabel: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  markerName: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  distanceText: {
    fontSize: 9,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  hud: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hudCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  hudLevel: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  xpBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 4,
    width: 100,
  },
  xpBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  xpText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hudStat: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  hudStatLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  refreshIcon: {
    fontSize: 24,
  },
  compass: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  compassText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  coordText: {
    fontSize: 8,
    color: colors.textSecondary,
  },
});

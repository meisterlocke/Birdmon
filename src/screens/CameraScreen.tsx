import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useGame } from '../context/GameContext';
import { EncounterModal } from '../components/EncounterModal';
import { SpawnedAnimal } from '../types';
import { getDistanceMeters } from '../utils/spawning';
import { getRarityColor, getRarityLabel } from '../utils/gameLogic';
import { colors, spacing, borderRadius, fontSize } from '../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { spawns, latitude, longitude, catchAnimal } = useGame();
  const [selectedSpawn, setSelectedSpawn] = useState<SpawnedAnimal | null>(null);
  const [showEncounter, setShowEncounter] = useState(false);
  const [catchResult, setCatchResult] = useState<any>(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const nearbySpawns = spawns.filter(s => {
    if (s.caught || s.despawnTime < Date.now()) return false;
    return getDistanceMeters(latitude, longitude, s.latitude, s.longitude) <= 200;
  });

  function handleSpawnPress(spawn: SpawnedAnimal) {
    setSelectedSpawn(spawn);
    setCatchResult(null);
    setShowEncounter(true);
  }

  async function handleCatch() {
    if (!selectedSpawn) return;
    const result = await catchAnimal(selectedSpawn);
    setCatchResult(result);
  }

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📸</Text>
        <Text style={styles.permissionTitle}>Kamera-Zugriff</Text>
        <Text style={styles.permissionText}>
          Aktiviere die Kamera, um Tiere in der AR-Ansicht zu entdecken und zu dokumentieren.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Kamera aktivieren</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        {/* AR Overlay */}
        <View style={styles.overlay}>
          {/* Scanning line */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{
                  translateY: scanAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCREEN_HEIGHT - 200],
                  }),
                }],
              },
            ]}
          />

          {/* Crosshair */}
          <View style={styles.crosshair}>
            <View style={[styles.crosshairLine, styles.crosshairH]} />
            <View style={[styles.crosshairLine, styles.crosshairV]} />
            <View style={styles.crosshairCircle} />
          </View>

          {/* Top info bar */}
          <View style={styles.topBar}>
            <Text style={styles.arTitle}>🔍 AR-Scanner</Text>
            <Text style={styles.nearbyCount}>
              {nearbySpawns.length} {nearbySpawns.length === 1 ? 'Tier' : 'Tiere'} in der Nähe
            </Text>
          </View>

          {/* Nearby animals floating */}
          {nearbySpawns.map((spawn, index) => {
            const angle = (index / nearbySpawns.length) * Math.PI * 2;
            const radius = 100;
            const x = SCREEN_WIDTH / 2 + Math.cos(angle) * radius - 30;
            const y = SCREEN_HEIGHT / 2 + Math.sin(angle) * radius - 30;

            return (
              <TouchableOpacity
                key={spawn.id}
                style={[styles.arAnimal, { left: x, top: y }]}
                onPress={() => handleSpawnPress(spawn)}
              >
                <View style={[styles.arAnimalCircle, { borderColor: getRarityColor(spawn.animal.rarity) }]}>
                  <Text style={styles.arAnimalEmoji}>{spawn.animal.emoji}</Text>
                </View>
                <View style={[styles.arAnimalLabel, { backgroundColor: getRarityColor(spawn.animal.rarity) }]}>
                  <Text style={styles.arAnimalName}>{spawn.animal.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {nearbySpawns.length === 0 && (
            <View style={styles.noAnimals}>
              <Text style={styles.noAnimalsEmoji}>🌿</Text>
              <Text style={styles.noAnimalsText}>
                Kein Tier in unmittelbarer Nähe.{'\n'}Bewege dich, um Tiere zu finden!
              </Text>
            </View>
          )}
        </View>
      </CameraView>

      <EncounterModal
        spawn={selectedSpawn}
        visible={showEncounter}
        onCatch={handleCatch}
        onClose={() => {
          setShowEncounter(false);
          setSelectedSpawn(null);
          setCatchResult(null);
        }}
        catchResult={catchResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(82, 183, 136, 0.6)',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  crosshair: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 30,
    top: SCREEN_HEIGHT / 2 - 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  crosshairH: {
    width: 40,
    height: 1,
  },
  crosshairV: {
    width: 1,
    height: 40,
  },
  crosshairCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: spacing.sm,
  },
  arTitle: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  nearbyCount: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  arAnimal: {
    position: 'absolute',
    alignItems: 'center',
  },
  arAnimalCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  arAnimalEmoji: {
    fontSize: 26,
  },
  arAnimalLabel: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  arAnimalName: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  noAnimals: {
    position: 'absolute',
    bottom: 150,
    left: spacing.xl,
    right: spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  noAnimalsEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  noAnimalsText: {
    color: '#FFF',
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  permissionEmoji: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});

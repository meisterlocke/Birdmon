import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SpawnedAnimal } from '../types';
import { getRarityColor } from '../utils/gameLogic';
import { colors, borderRadius } from '../utils/theme';

interface Props {
  spawn: SpawnedAnimal;
  onPress: () => void;
}

export function AnimalMarker({ spawn, onPress }: Props) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    if (spawn.animal.rarity === 'rare' || spawn.animal.rarity === 'very_rare' || spawn.animal.rarity === 'legendary') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const rarityColor = getRarityColor(spawn.animal.rarity);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: bounceAnim }] },
        ]}
      >
        {(spawn.animal.rarity === 'rare' || spawn.animal.rarity === 'very_rare' || spawn.animal.rarity === 'legendary') && (
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: rarityColor,
                opacity: glowAnim,
              },
            ]}
          />
        )}
        <View style={[styles.marker, { borderColor: rarityColor }]}>
          <Text style={styles.emoji}>{spawn.animal.emoji}</Text>
        </View>
        <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: -5,
  },
  marker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emoji: {
    fontSize: 24,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
});

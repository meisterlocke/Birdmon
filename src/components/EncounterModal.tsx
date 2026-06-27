import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SpawnedAnimal } from '../types';
import { getRarityColor, getRarityLabel, getCategoryLabel } from '../utils/gameLogic';
import { colors, spacing, borderRadius, fontSize } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  spawn: SpawnedAnimal | null;
  visible: boolean;
  onCatch: () => void;
  onClose: () => void;
  catchResult?: {
    isNewDiscovery: boolean;
    newAchievements: string[];
    xpGained: number;
  } | null;
}

export function EncounterModal({ spawn, visible, onCatch, onClose, catchResult }: Props) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;
  const [showCatchButton, setShowCatchButton] = useState(true);

  useEffect(() => {
    if (visible) {
      setShowCatchButton(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 6,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(emojiAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(emojiAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      slideAnim.setValue(0);
      scaleAnim.setValue(0.5);
    }
  }, [visible]);

  useEffect(() => {
    if (catchResult) {
      setShowCatchButton(false);
    }
  }, [catchResult]);

  if (!spawn) return null;

  const rarityColor = getRarityColor(spawn.animal.rarity);

  const emojiRotation = emojiAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-5deg', '0deg', '5deg', '0deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: slideAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.header, { backgroundColor: rarityColor }]}>
            <Text style={styles.rarityLabel}>{getRarityLabel(spawn.animal.rarity)}</Text>
            <Text style={styles.categoryLabel}>{getCategoryLabel(spawn.animal.category)}</Text>
          </View>

          <View style={styles.content}>
            <Animated.Text
              style={[
                styles.bigEmoji,
                { transform: [{ rotate: emojiRotation }] },
              ]}
            >
              {spawn.animal.emoji}
            </Animated.Text>

            <Text style={styles.animalName}>{spawn.animal.name}</Text>
            <Text style={styles.scientificName}>{spawn.animal.scientificName}</Text>
            <Text style={styles.description}>{spawn.animal.description}</Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Größe</Text>
                <Text style={styles.statValue}>{spawn.animal.size}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Nahrung</Text>
                <Text style={styles.statValue}>{spawn.animal.diet}</Text>
              </View>
            </View>

            <View style={styles.funFactBox}>
              <Text style={styles.funFactIcon}>💡</Text>
              <Text style={styles.funFactText}>{spawn.animal.funFact}</Text>
            </View>

            {catchResult ? (
              <View style={styles.resultContainer}>
                {catchResult.isNewDiscovery && (
                  <View style={styles.newDiscovery}>
                    <Text style={styles.newDiscoveryText}>🌟 Neue Entdeckung!</Text>
                  </View>
                )}
                <Text style={styles.xpText}>+{catchResult.xpGained} XP</Text>
                {catchResult.newAchievements.length > 0 && (
                  <Text style={styles.achievementText}>
                    🏆 Neues Achievement freigeschaltet!
                  </Text>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>Weiter</Text>
                </TouchableOpacity>
              </View>
            ) : showCatchButton ? (
              <TouchableOpacity
                style={[styles.catchButton, { backgroundColor: rarityColor }]}
                onPress={onCatch}
                activeOpacity={0.8}
              >
                <Text style={styles.catchButtonText}>📸 Beobachten & Dokumentieren</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
              <Text style={styles.dismissText}>Schließen</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rarityLabel: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  bigEmoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  animalName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  scientificName: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    width: '100%',
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  funFactBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
    gap: spacing.sm,
  },
  funFactIcon: {
    fontSize: 20,
  },
  funFactText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#92400E',
    lineHeight: 20,
  },
  catchButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  catchButtonText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  dismissButton: {
    paddingVertical: spacing.sm,
  },
  dismissText: {
    color: colors.textLight,
    fontSize: fontSize.md,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  newDiscovery: {
    backgroundColor: '#FEF3C7',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  newDiscoveryText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#92400E',
  },
  xpText: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.success,
    marginBottom: spacing.sm,
  },
  achievementText: {
    fontSize: fontSize.md,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});

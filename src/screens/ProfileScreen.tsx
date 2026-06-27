import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { animals } from '../data/animals';
import { achievements } from '../data/achievements';
import { getRarityColor, getRarityLabel, getCategoryEmoji } from '../utils/gameLogic';
import { colors, spacing, borderRadius, fontSize } from '../utils/theme';
import { AnimalCategory, Rarity } from '../types';

export function ProfileScreen() {
  const { profile, discovered, resetGame } = useGame();

  const discoveredAnimals = Object.keys(discovered);
  const discoveredByCategory: Record<string, number> = {};
  const discoveredByRarity: Record<string, number> = {};

  for (const id of discoveredAnimals) {
    const animal = animals.find(a => a.id === id);
    if (animal) {
      discoveredByCategory[animal.category] = (discoveredByCategory[animal.category] || 0) + 1;
      discoveredByRarity[animal.rarity] = (discoveredByRarity[animal.rarity] || 0) + 1;
    }
  }

  const xpProgress = profile.xpToNextLevel > 0
    ? 1 - (profile.xpToNextLevel / (profile.xp + profile.xpToNextLevel))
    : 0;

  function handleReset() {
    Alert.alert(
      'Spiel zurücksetzen?',
      'Dein gesamter Fortschritt geht verloren! Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: resetGame,
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>🌿</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.joinDate}>
          Dabei seit {new Date(profile.startDate).toLocaleDateString('de-DE')}
        </Text>
      </View>

      {/* Level Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>Level</Text>
          <Text style={styles.levelValue}>{profile.level}</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { width: `${xpProgress * 100}%` }]} />
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.xpText}>{profile.xp} XP</Text>
          <Text style={styles.xpNeeded}>Noch {profile.xpToNextLevel} XP bis Level {profile.level + 1}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard icon="📋" value={`${discoveredAnimals.length}`} label="Arten entdeckt" total={`/ ${animals.length}`} />
        <StatCard icon="👀" value={`${profile.totalEncounters}`} label="Beobachtungen" />
        <StatCard icon="🏆" value={`${profile.achievements.length}`} label="Achievements" total={`/ ${achievements.length}`} />
        <StatCard icon="⭐" value={`${profile.xp}`} label="Gesamt-XP" />
      </View>

      {/* Category Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fortschritt nach Kategorie</Text>
        {(['bird', 'mammal', 'reptile', 'amphibian', 'insect', 'fish'] as AnimalCategory[]).map(cat => {
          const total = animals.filter(a => a.category === cat).length;
          const found = discoveredByCategory[cat] || 0;
          const progress = total > 0 ? found / total : 0;
          const labels: Record<string, string> = {
            bird: 'Vögel',
            mammal: 'Säugetiere',
            reptile: 'Reptilien',
            amphibian: 'Amphibien',
            insect: 'Insekten',
            fish: 'Fische',
          };
          return (
            <View key={cat} style={styles.categoryRow}>
              <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat)}</Text>
              <View style={styles.categoryInfo}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{labels[cat]}</Text>
                  <Text style={styles.categoryCount}>{found} / {total}</Text>
                </View>
                <View style={styles.categoryBar}>
                  <View style={[styles.categoryProgress, { width: `${progress * 100}%` }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Rarity Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nach Seltenheit</Text>
        {(['common', 'uncommon', 'rare', 'very_rare', 'legendary'] as Rarity[]).map(rarity => {
          const total = animals.filter(a => a.rarity === rarity).length;
          const found = discoveredByRarity[rarity] || 0;
          return (
            <View key={rarity} style={styles.rarityRow}>
              <View style={[styles.rarityDot, { backgroundColor: getRarityColor(rarity) }]} />
              <Text style={styles.rarityLabel}>{getRarityLabel(rarity)}</Text>
              <Text style={styles.rarityCount}>{found} / {total}</Text>
            </View>
          );
        })}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.map(ach => {
          const earned = profile.achievements.includes(ach.id);
          return (
            <View key={ach.id} style={[styles.achievementRow, !earned && styles.achievementLocked]}>
              <Text style={styles.achievementIcon}>{earned ? ach.icon : '🔒'}</Text>
              <View style={styles.achievementInfo}>
                <Text style={[styles.achievementName, !earned && styles.achievementNameLocked]}>
                  {ach.name}
                </Text>
                <Text style={styles.achievementDesc}>{ach.description}</Text>
              </View>
              {earned && <Text style={styles.checkmark}>✅</Text>}
            </View>
          );
        })}
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>Spiel zurücksetzen</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Birdmon v1.0</Text>
        <Text style={styles.footerText}>Entdecke die Natur vor deiner Haustür!</Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, value, label, total }: { icon: string; value: string; label: string; total?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {total && <Text style={styles.statTotal}>{total}</Text>}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.md,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#FFF',
  },
  joinDate: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  levelCard: {
    margin: spacing.md,
    marginTop: -spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  levelValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    color: colors.primary,
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  xpBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  xpNeeded: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  statTotal: {
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryEmoji: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  categoryCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  categoryBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  categoryProgress: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 3,
  },
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rarityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rarityLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  rarityCount: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  achievementNameLocked: {
    color: colors.textLight,
  },
  achievementDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  checkmark: {
    fontSize: 18,
  },
  resetButton: {
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  resetText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
});

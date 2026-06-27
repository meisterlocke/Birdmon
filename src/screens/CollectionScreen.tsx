import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { animals } from '../data/animals';
import { Animal, AnimalCategory } from '../types';
import {
  getRarityColor,
  getRarityLabel,
  getCategoryLabel,
  getCategoryEmoji,
} from '../utils/gameLogic';
import { colors, spacing, borderRadius, fontSize } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterCategory = 'all' | AnimalCategory;

const CATEGORIES: { key: FilterCategory; label: string; emoji: string }[] = [
  { key: 'all', label: 'Alle', emoji: '🌍' },
  { key: 'bird', label: 'Vögel', emoji: '🐦' },
  { key: 'mammal', label: 'Säugetiere', emoji: '🐾' },
  { key: 'reptile', label: 'Reptilien', emoji: '🦎' },
  { key: 'amphibian', label: 'Amphibien', emoji: '🐸' },
  { key: 'insect', label: 'Insekten', emoji: '🦋' },
  { key: 'fish', label: 'Fische', emoji: '🐟' },
];

export function CollectionScreen() {
  const { discovered } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  const filteredAnimals = useMemo(() => {
    if (selectedCategory === 'all') return animals;
    return animals.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  const discoveredCount = Object.keys(discovered).length;
  const totalCount = animals.length;

  if (selectedAnimal) {
    const disc = discovered[selectedAnimal.id];
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.detailContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedAnimal(null)}>
          <Text style={styles.backText}>← Zurück</Text>
        </TouchableOpacity>

        <View style={[styles.detailHeader, { backgroundColor: getRarityColor(selectedAnimal.rarity) }]}>
          <Text style={styles.detailEmoji}>{disc ? selectedAnimal.emoji : '❓'}</Text>
          <Text style={styles.detailName}>{disc ? selectedAnimal.name : '???'}</Text>
          {disc && (
            <Text style={styles.detailScientific}>{selectedAnimal.scientificName}</Text>
          )}
        </View>

        {disc ? (
          <View style={styles.detailBody}>
            <Text style={styles.detailDescription}>{selectedAnimal.description}</Text>

            <View style={styles.infoGrid}>
              <InfoCard label="Kategorie" value={getCategoryLabel(selectedAnimal.category)} emoji={getCategoryEmoji(selectedAnimal.category)} />
              <InfoCard label="Seltenheit" value={getRarityLabel(selectedAnimal.rarity)} color={getRarityColor(selectedAnimal.rarity)} />
              <InfoCard label="Größe" value={selectedAnimal.size} />
              <InfoCard label="Nahrung" value={selectedAnimal.diet} />
              <InfoCard label="Farbe" value={selectedAnimal.color} />
              <InfoCard label="XP-Belohnung" value={`${selectedAnimal.xpReward} XP`} />
            </View>

            <View style={styles.funFactBox}>
              <Text style={styles.funFactIcon}>💡</Text>
              <Text style={styles.funFactText}>{selectedAnimal.funFact}</Text>
            </View>

            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>Deine Beobachtungen</Text>
              <Text style={styles.statsValue}>Gesehen: {disc.timesSeen}x</Text>
              <Text style={styles.statsValue}>
                Erstmals: {new Date(disc.firstSeen).toLocaleDateString('de-DE')}
              </Text>
              <Text style={styles.statsValue}>
                Zuletzt: {new Date(disc.lastSeen).toLocaleDateString('de-DE')}
              </Text>
            </View>

            <View style={styles.habitatSection}>
              <Text style={styles.statsTitle}>Lebensraum</Text>
              <View style={styles.habitatTags}>
                {selectedAnimal.habitat.map(h => (
                  <View key={h} style={styles.habitatTag}>
                    <Text style={styles.habitatTagText}>{getHabitatLabel(h)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.detailBody}>
            <Text style={styles.undiscoveredText}>
              Dieses Tier hast du noch nicht entdeckt. Suche in den richtigen Lebensräumen zur passenden Tageszeit!
            </Text>
            <View style={styles.hintBox}>
              <Text style={styles.hintTitle}>Hinweise:</Text>
              <Text style={styles.hintText}>
                Lebensraum: {selectedAnimal.habitat.map(getHabitatLabel).join(', ')}
              </Text>
              <Text style={styles.hintText}>
                Aktiv: {selectedAnimal.activeTime.map(getTimeLabel).join(', ')}
              </Text>
              <Text style={styles.hintText}>
                Saison: {selectedAnimal.seasons.map(getSeasonLabel).join(', ')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Naturführer</Text>
        <Text style={styles.subtitle}>
          {discoveredCount} / {totalCount} Arten entdeckt
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(discoveredCount / totalCount) * 100}%` }]} />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.filterChip,
              selectedCategory === cat.key && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={styles.filterEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.filterLabel,
                selectedCategory === cat.key && styles.filterLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Animal Grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {filteredAnimals.map(animal => {
          const disc = discovered[animal.id];
          const rarityColor = getRarityColor(animal.rarity);

          return (
            <TouchableOpacity
              key={animal.id}
              style={[
                styles.animalCard,
                !disc && styles.animalCardUndiscovered,
              ]}
              onPress={() => setSelectedAnimal(animal)}
              activeOpacity={0.7}
            >
              <View style={[styles.rarityStripe, { backgroundColor: rarityColor }]} />
              <Text style={styles.cardEmoji}>{disc ? animal.emoji : '❓'}</Text>
              <Text style={[styles.cardName, !disc && styles.cardNameHidden]} numberOfLines={1}>
                {disc ? animal.name : '???'}
              </Text>
              {disc && (
                <Text style={styles.cardSeen}>{disc.timesSeen}x</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function InfoCard({ label, value, emoji, color }: { label: string; value: string; emoji?: string; color?: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color ? { color } : null]}>
        {emoji ? `${emoji} ` : ''}{value}
      </Text>
    </View>
  );
}

function getHabitatLabel(h: string): string {
  const map: Record<string, string> = {
    forest: '🌲 Wald',
    meadow: '🌿 Wiese',
    water: '💧 Gewässer',
    urban: '🏘️ Stadt',
    mountain: '⛰️ Gebirge',
    wetland: '🌊 Feuchtgebiet',
  };
  return map[h] || h;
}

function getTimeLabel(t: string): string {
  const map: Record<string, string> = {
    dawn: '🌅 Morgengrauen',
    day: '☀️ Tag',
    dusk: '🌇 Dämmerung',
    night: '🌙 Nacht',
  };
  return map[t] || t;
}

function getSeasonLabel(s: string): string {
  const map: Record<string, string> = {
    spring: '🌸 Frühling',
    summer: '☀️ Sommer',
    autumn: '🍂 Herbst',
    winter: '❄️ Winter',
  };
  return map[s] || s;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#FFF',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  filterContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    maxHeight: 60,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: '#FFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  animalCard: {
    width: (SCREEN_WIDTH - spacing.sm * 5) / 3,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    overflow: 'hidden',
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
  animalCardUndiscovered: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  rarityStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  cardEmoji: {
    fontSize: 32,
    marginVertical: spacing.xs,
  },
  cardName: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  cardNameHidden: {
    color: colors.textLight,
  },
  cardSeen: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Detail view
  backButton: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.primary,
  },
  backText: {
    color: '#FFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  detailContent: {
    paddingBottom: spacing.xxl,
  },
  detailHeader: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  detailEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  detailName: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    color: '#FFF',
  },
  detailScientific: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  detailBody: {
    padding: spacing.lg,
  },
  detailDescription: {
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoCard: {
    width: '48%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  funFactBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  funFactIcon: {
    fontSize: 20,
  },
  funFactText: {
    flex: 1,
    fontSize: fontSize.md,
    color: '#92400E',
    lineHeight: 22,
  },
  statsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statsValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  habitatSection: {
    marginBottom: spacing.md,
  },
  habitatTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  habitatTag: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  habitatTagText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  undiscoveredText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.lg,
  },
  hintBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  hintTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  hintText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

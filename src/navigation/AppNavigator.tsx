import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapScreen } from '../screens/MapScreen';
import { CollectionScreen } from '../screens/CollectionScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, fontSize } from '../utils/theme';

type Tab = 'map' | 'camera' | 'collection' | 'profile';

const TABS: { key: Tab; emoji: string; label: string }[] = [
  { key: 'map', emoji: '🗺️', label: 'Karte' },
  { key: 'camera', emoji: '📸', label: 'Scanner' },
  { key: 'collection', emoji: '📖', label: 'Sammlung' },
  { key: 'profile', emoji: '👤', label: 'Profil' },
];

export function AppNavigator() {
  const [activeTab, setActiveTab] = useState<Tab>('map');

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        {activeTab === 'map' && <MapScreen />}
        {activeTab === 'camera' && <CameraScreen />}
        {activeTab === 'collection' && <CollectionScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      <SafeAreaView edges={['bottom']} style={styles.tabBar}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabEmoji, !active && styles.tabInactive]}>
                {tab.emoji}
              </Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  screen: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 4,
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabInactive: {
    opacity: 0.4,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
  },
});

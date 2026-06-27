import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { MapScreen } from '../screens/MapScreen';
import { CollectionScreen } from '../screens/CollectionScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, fontSize } from '../utils/theme';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 8,
            paddingTop: 8,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🗺️" label="Karte" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📸" label="Scanner" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Collection"
          component={CollectionScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📖" label="Sammlung" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="👤" label="Profil" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

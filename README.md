# Birdmon - Entdecke die Natur vor deiner Haustür

Eine Pokémon-Go-ähnliche App für iPhone und Android, mit der du **echte heimische Tiere** in deiner Umgebung entdecken, beobachten und dokumentieren kannst.

## Features

- **Karten-Ansicht**: Finde Tiere auf der Karte in deiner Umgebung. Tiere spawnen basierend auf Lebensraum, Tageszeit und Jahreszeit
- **AR-Scanner**: Nutze die Kamera, um Tiere in der AR-Ansicht zu entdecken
- **Naturführer**: Sammle und dokumentiere alle 35+ heimischen Tierarten
- **Levelsystem & XP**: Steige im Level auf, indem du neue Arten entdeckst
- **Achievements**: Schalte Erfolge frei (Vogelfreund, Spurenleser, Legendäre Begegnung...)
- **Seltenheitsstufen**: Von häufig (Amsel) bis legendär (Luchs, Wolf, Steinadler)

## Tierarten

Das Spiel enthält über 35 echte mitteleuropäische Tierarten aus 6 Kategorien:

| Kategorie | Beispiele |
|-----------|-----------|
| Vögel | Amsel, Rotkehlchen, Eisvogel, Uhu, Steinadler |
| Säugetiere | Rotfuchs, Reh, Igel, Luchs, Wolf |
| Reptilien | Ringelnatter, Zauneidechse, Blindschleiche |
| Amphibien | Grasfrosch, Feuersalamander, Bergmolch |
| Insekten | Admiral, Schwalbenschwanz, Hirschkäfer, Glühwürmchen |
| Fische | Bachforelle, Hecht |

## Spielmechaniken

- **Habitat-basiertes Spawning**: Tiere erscheinen je nach Umgebung (Wald, Wiese, Gewässer, Stadt, Gebirge)
- **Tageszeit-abhängig**: Eulen nachts, Schmetterlinge tagsüber, Füchse in der Dämmerung
- **Saisonabhängig**: Störche im Sommer, Winterschlaf-Tiere nur in bestimmten Monaten
- **Seltenheits-gewichtet**: Legendäre Tiere sind extrem selten und verschwinden schnell

## Tech Stack

- **React Native** mit **Expo**
- **TypeScript** für Typsicherheit
- **expo-location** für GPS-Tracking
- **expo-camera** für AR-Scanner
- **AsyncStorage** für lokale Datenpersistenz
- **React Navigation** für Tab-basierte Navigation

## Installation & Start

```bash
# Abhängigkeiten installieren
npm install

# App starten
npx expo start

# Auf dem Gerät
# Scanne den QR-Code mit der Expo Go App (iOS/Android)
```

## Projektstruktur

```
src/
├── components/      # Wiederverwendbare UI-Komponenten
├── context/         # React Context für Spielzustand
├── data/            # Tierdatenbank & Achievements
├── hooks/           # Custom React Hooks
├── navigation/      # App-Navigation
├── screens/         # Bildschirme (Karte, Scanner, Sammlung, Profil)
├── types/           # TypeScript-Typdefinitionen
└── utils/           # Spiellogik, Spawning, Theme
```

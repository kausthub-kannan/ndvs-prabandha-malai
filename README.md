# Prabandha Malai

Prabandha Malai is a cross-platform mobile and web application built to help users explore, read, and understand sacred texts, specifically focusing on Pasurams, Alwars, Acharyas, and Divya Deshams. 

Built with React Native and Expo, this app offers a seamless and responsive experience across iOS, Android, and Web platforms.

## Features

- **Pasurams Library**: Read verses (Pasurams) complete with detailed meanings and purports.
- **Divya Deshams Exploration**: Learn about various Divya Deshams and discover nearby locations using integrated maps.
- **Alwars & Acharyas**: Dedicated sections to explore the histories and contributions of Alwars and Acharyas.
- **Glossary**: A comprehensive glossary of terms to assist in understanding complex texts.
- **Favorites & Bookmarks**: Save your favorite Pasurams and items for quick access later.
- **Offline Support**: Powered by a local SQLite database for fast, offline-capable content delivery.
- **Customizable UI**: Supports dynamic theming (Dark/Light mode) and responsive typography.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 54)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- npm or yarn or pnpm
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (for Mac) or Android Emulator for local mobile testing.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kausthub-kannan/ndvs-prabandha-malai.git
   cd ndvs-prabandha-malai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the Expo development server:

```bash
npm start
```

From the Expo CLI, you can press:
- `a` to open the app on an Android emulator or connected device.
- `i` to open the app on an iOS simulator (Mac only).
- `w` to open the app in a web browser.

## Scripts

- `npm start`: Starts the Expo Metro bundler.
- `npm run android`: Starts the app on Android.
- `npm run ios`: Starts the app on iOS.
- `npm run web`: Starts the web version.
- `npm run lint`: Runs ESLint to check for code issues.
- `npm run reset-project`: Utility script to reset the project state.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to get involved, our development workflow, and coding guidelines.

## License

Please refer to the `LICENCE` file in the root directory for more information.

# P28 - React Native App

A React Native application built with Expo.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js) or **yarn**
- **Expo CLI** (install globally with `npm install -g @expo/cli`)

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd p28
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Project

### Start the Development Server

```bash
npx expo start
```

This will start the Expo development server and open the Expo DevTools in your browser.

### Run on Different Platforms

- **iOS Simulator**:
  ```bash
  npm run ios
  # or
  yarn ios
  ```

- **Android Emulator**:
  ```bash
  npm run android
  # or
  yarn android
  ```

- **Web Browser**:
  ```bash
  npm run web
  # or
  yarn web
  ```

### Running on Physical Devices

1. Install the **Expo Go** app on your mobile device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code displayed in your terminal or browser with the Expo Go app

## Project Structure

```
p28/
├── App.tsx              # Main application component
├── assets/              # Images and static assets
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── index.ts            # Entry point
```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run in web browser

## Dependencies

- **React Native** 0.79.6
- **Expo** ~53.0.22
- **React** 19.0.0
- **TypeScript** ~5.8.3

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Try clearing the cache:
   ```bash
   npx expo start --clear
   ```

2. **Dependencies issues**: Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **iOS Simulator not working**: Ensure Xcode is properly installed and configured

4. **Android Emulator not working**: Ensure Android Studio and SDK are properly configured

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Visit the [React Native documentation](https://reactnative.dev/)
- Search for issues in the [Expo GitHub repository](https://github.com/expo/expo)

## Development

The main application code is in `App.tsx`. Start editing this file to modify the app. The app will automatically reload when you save changes.

## Building for Production

When you're ready to build for production:

```bash
npx expo build:android  # For Android APK
npx expo build:ios      # For iOS (requires Apple Developer account)
```

## License

This project is private and proprietary.

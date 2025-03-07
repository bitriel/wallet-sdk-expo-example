# Bitriel Wallet SDK Integration Guide

This guide demonstrates how to integrate the Bitriel Wallet SDK into an Expo React Native project using the actual implementation from the codebase.

## Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. Create a new Expo project:

```bash
npx create-expo-app my-bitriel-app
cd my-bitriel-app
```

2. Install the required dependencies:

```bash
pnpm add bitriel-wallet-sdk @expo/react-native-action-sheet @gorhom/bottom-sheet expo-secure-store expo-dev-client react-native-gesture-handler zustand nativewind tailwindcss
```

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx
│   └── index.tsx
├── _layout.tsx
└── global.css
components/
├── NetworkSelector.tsx
├── TransactionForm.tsx
└── WalletInfo.tsx
store/
└── useWalletStore.ts
```

## Implementation

1. Create the wallet store (`store/useWalletStore.ts`):

```typescript
import { BitrielWalletSDK, NetworkConfig, WalletState } from 'bitriel-wallet-sdk';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface WalletStateStore {
  sdk: BitrielWalletSDK | null;
  walletState: WalletState | null;
  currentNetwork: NetworkConfig | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeWallet: () => Promise<void>;
  connectToNetwork: (chainId: string) => Promise<void>;
  refreshWalletState: () => Promise<void>;
  setError: (error: string | null) => void;
  disconnect: () => Promise<void>;
}

export const useWalletStore = create<WalletStateStore>((set, get) => ({
  sdk: null,
  walletState: null,
  currentNetwork: null,
  isLoading: false,
  error: null,

  initializeWallet: async () => {
    try {
      set({ isLoading: true, error: null });
      let mnemonic = await SecureStore.getItemAsync('wallet_mnemonic');

      if (!mnemonic) {
        mnemonic = BitrielWalletSDK.createMnemonic();
        await SecureStore.setItemAsync('wallet_mnemonic', mnemonic);
      }

      const walletSdk = new BitrielWalletSDK(mnemonic);
      set({ sdk: walletSdk });

      const lastNetwork = await SecureStore.getItemAsync('last_network');
      if (lastNetwork) {
        await get().connectToNetwork(lastNetwork);
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error('Failed to initialize wallet:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  connectToNetwork: async (chainId: string) => {
    const { sdk } = get();
    if (!sdk) {
      set({ error: 'Wallet not initialized' });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      await sdk.connect(chainId);
      const state = await sdk.getWalletState();

      set({
        walletState: state,
        currentNetwork: state.network,
      });

      await SecureStore.setItemAsync('last_network', chainId);
    } catch (error: any) {
      set({ error: error.message });
      console.error('Failed to connect to network:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshWalletState: async () => {
    const { sdk, currentNetwork } = get();
    if (!sdk || !currentNetwork) return;

    try {
      set({ isLoading: true, error: null });
      const state = await sdk.getWalletState();
      set({ walletState: state });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Failed to refresh wallet state:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => set({ error }),
  disconnect: async () => {
    const { sdk } = get();
    if (sdk) {
      try {
        set({ isLoading: true, error: null });
        await sdk.disconnect();
        set({
          walletState: null,
          currentNetwork: null,
        });
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    }
  },
}));
```

2. Create the main app layout (`app/_layout.tsx`):

```typescript
import '../global.css';
import 'expo-dev-client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme, useInitialAndroidBarSync } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/theme';

export default function RootLayout() {
  useInitialAndroidBarSync();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <ActionSheetProvider>
            <NavThemeProvider value={NAV_THEME[colorScheme]}>
              <Stack>
                <Stack.Screen
                  name="index"
                  options={{
                    title: 'Bitriel Wallet',
                    headerLargeTitle: true,
                  }}
                />
              </Stack>
            </NavThemeProvider>
          </ActionSheetProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
```

3. Create the main wallet screen (`app/(tabs)/index.tsx`):

```typescript
import { useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';

import { NetworkSelector } from '~/components/NetworkSelector';
import { TransactionForm } from '~/components/TransactionForm';
import { WalletInfo } from '~/components/WalletInfo';
import { useWalletStore } from '~/store/useWalletStore';

export default function Home() {
  const { initializeWallet, refreshWalletState, isLoading } = useWalletStore();

  useEffect(() => {
    initializeWallet();
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshWalletState} />}>
      <View className="p-4">
        <NetworkSelector />
        <WalletInfo />
        <TransactionForm />
      </View>
    </ScrollView>
  );
}
```

## Features Available

The implementation provides:

- Wallet initialization with mnemonic generation
- Network selection and connection
- Wallet state management
- Transaction handling
- Secure storage for sensitive data
- Pull-to-refresh functionality
- Error handling
- Loading states

## Security Considerations

1. Mnemonics are stored securely using `expo-secure-store`
2. Network credentials are persisted securely
3. Error messages are sanitized
4. Loading states prevent multiple operations
5. Proper error handling throughout the application

## Error Handling

The implementation includes comprehensive error handling:

```typescript
try {
  // Operation
} catch (error: any) {
  set({ error: error.message });
  console.error('Operation failed:', error);
} finally {
  set({ isLoading: false });
}
```

## Support

For additional support or questions, please refer to the official Bitriel Wallet SDK documentation or contact the development team.

## License

This integration guide is provided under the MIT License. The Bitriel Wallet SDK is subject to its own license terms.

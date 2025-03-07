import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import { useWalletStore } from '~/store/useWalletStore';
import { formatBalance } from '~/utils/formatters';
export const WalletInfo = () => {
  const { walletState, currentNetwork, isLoading, error, disconnect } = useWalletStore();

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const handleClearStorage = async () => {
    Alert.alert(
      'Clear Wallet',
      'This will clear all wallet data and disconnect from the network. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('wallet_mnemonic');
              await SecureStore.deleteItemAsync('last_network');
              await disconnect();
            } catch (error) {
              console.error('Failed to clear storage:', error);
            }
          },
        },
      ]
    );
  };

  if (error) {
    return (
      <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="mb-4 items-center rounded-2xl bg-white p-4 shadow-sm">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!walletState) {
    return (
      <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <Text className="italic text-gray-500">Not connected</Text>
      </View>
    );
  }

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-800">Wallet</Text>
        <TouchableOpacity className="rounded-lg bg-red-500 px-3 py-2" onPress={handleClearStorage}>
          <Text className="text-white">Clear Storage</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="mb-3 rounded-xl bg-gray-100 p-3"
        onPress={() => copyToClipboard(walletState.address)}>
        <Text className="text-sm text-gray-500">Address</Text>
        <Text className="font-medium text-gray-800" numberOfLines={1}>
          {walletState.address}
        </Text>
      </TouchableOpacity>

      <View className="rounded-xl bg-gray-100 p-3">
        <Text className="text-sm text-gray-500">Balance</Text>
        <Text className="font-medium text-gray-800">
          {formatBalance(walletState.balances.native, currentNetwork?.nativeCurrency.decimals!)}{' '}
          {currentNetwork?.nativeCurrency.symbol}
        </Text>
      </View>

      {walletState.balances.tokens.length > 0 && (
        <View className="mt-4">
          <Text className="mb-2 text-lg font-semibold">Tokens</Text>
          {walletState.balances.tokens.map((token: any) => (
            <View key={token.token.address} className="mb-2 rounded-xl bg-gray-100 p-3">
              <Text className="text-gray-800">
                {formatBalance(token.balance, currentNetwork?.nativeCurrency.decimals!)}{' '}
                {token.token.symbol}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

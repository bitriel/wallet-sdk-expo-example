import { SUPPORTED_NETWORKS } from 'bitriel-wallet-sdk';
import { Image } from 'expo-image';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

import { useWalletStore } from '~/store/useWalletStore';

export const NetworkSelector = () => {
  const { connectToNetwork, currentNetwork, isLoading } = useWalletStore();

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <Text className="mb-2 text-xl font-bold text-gray-800">Networks</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {SUPPORTED_NETWORKS.map((network) => (
          <TouchableOpacity
            key={network.chainId.toString()}
            className={`mr-2 flex-row items-center rounded-full px-4 py-2 ${
              isLoading ? 'opacity-50' : ''
            } ${currentNetwork?.chainId === network.chainId ? 'bg-blue-500' : 'bg-gray-100'}`}
            onPress={() => connectToNetwork(network.chainId.toString())}
            disabled={isLoading}>
            {network.logo && (
              <Image
                source={{ uri: network.logo }}
                style={{ width: 20, height: 20, marginRight: 8 }}
              />
            )}
            <Text
              className={`${currentNetwork?.chainId === network.chainId ? 'text-white' : 'text-gray-800'} font-medium`}>
              {network.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

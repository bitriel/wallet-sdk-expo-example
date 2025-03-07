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

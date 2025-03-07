import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Camera } from 'expo-camera';
import { useWalletStore, useWalletTransactions } from '~/store/useWalletStore';
import { isValidAddress } from '~/utils/validators';
import QRScanner from './QRScanner';

export const TransactionForm = () => {
  const { currentNetwork, walletState, isLoading } = useWalletStore();
  const { sendTransaction, estimateFee } = useWalletTransactions();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [scanning, setScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  const handleScan = async () => {
    if (hasCameraPermission) {
      setScanning(true);
    } else {
      Alert.alert('Camera Permission', 'Please grant camera permission to scan QR codes', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settings',
          onPress: () => {
            // Implement deep linking to app settings
            // You might want to use Linking from react-native
          },
        },
      ]);
    }
  };

  const handleScanned = (data: string) => {
    setRecipient(data);
    setScanning(false);
  };

  const handleSend = async () => {
    try {
      if (!currentNetwork) {
        Alert.alert('Error', 'Wallet not connected');
        return;
      }

      if (!isValidAddress(recipient, walletState?.network?.type!)) {
        Alert.alert('Error', 'Invalid recipient address');
        return;
      }

      const fee = await estimateFee(recipient, amount);

      Alert.alert(
        'Confirm Transaction',
        `Send ${amount} ${currentNetwork.nativeCurrency.symbol} to ${recipient}\n\nEstimated fee: ${fee.formatted} ${fee.currency}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                const { txHash } = await sendTransaction(recipient, amount);
                Alert.alert('Success', `Transaction sent: ${txHash}`);
                setRecipient('');
                setAmount('');
              } catch (error: any) {
                Alert.alert('Error', error.message);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <>
      <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <Text className="mb-4 text-xl font-bold text-gray-800">Send</Text>

        <View className="mb-3 flex-row">
          <TextInput
            className="mr-2 flex-1 rounded-xl bg-gray-100 p-3"
            placeholder="Recipient Address"
            value={recipient}
            onChangeText={setRecipient}
            editable={!isLoading}
          />
          <TouchableOpacity
            className={`rounded-xl bg-blue-500 p-3 ${isLoading ? 'opacity-50' : ''}`}
            onPress={handleScan}
            disabled={isLoading}>
            <Text className="text-white">Scan</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          className="mb-4 rounded-xl bg-gray-100 p-3"
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          editable={!isLoading}
        />

        <TouchableOpacity
          className={`rounded-xl p-4 ${isLoading || !recipient || !amount ? 'bg-gray-300' : 'bg-blue-500'}`}
          onPress={handleSend}
          disabled={isLoading || !recipient || !amount}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center font-medium text-white">Send</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Scanner Modal */}
      <Modal visible={scanning} animationType="slide" presentationStyle="fullScreen">
        <QRScanner />
      </Modal>
    </>
  );
};

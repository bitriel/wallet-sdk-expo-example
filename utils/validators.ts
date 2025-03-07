export const isValidAddress = (address: string, networkType: string): boolean => {
  if (!address) return false;

  if (networkType === 'substrate') {
    // Basic Substrate address validation (enhance as needed)
    return address.length === 48 && address.startsWith('5');
  } else if (networkType === 'evm') {
    // Basic EVM address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  return false;
};

export const formatTransactionRequest = (network: any, recipient: string, amount: string) => {
  if (network.type === 'substrate') {
    return {
      method: 'balances',
      params: ['transfer', recipient, amount],
    };
  } else if (network.type === 'evm') {
    return {
      to: recipient,
      value: amount,
    };
  }
  throw new Error('Unsupported network type');
};

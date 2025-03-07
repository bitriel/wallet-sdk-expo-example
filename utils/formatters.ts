export const formatBalance = (balance: string, decimals: number, precision: number = 5): string => {
  try {
    const balanceBigInt = BigInt(balance);
    const divisor = BigInt(10) ** BigInt(decimals);
    const wholePart = (balanceBigInt / divisor).toString();
    let fractionalPart = (balanceBigInt % divisor).toString().padStart(decimals, '0');

    // Trim fractional part to the specified precision (5 decimal places)
    fractionalPart = fractionalPart.slice(0, precision);

    // Format whole part with commas for readability
    const formattedWhole = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formattedWhole}.${fractionalPart}`;
  } catch (error) {
    console.warn('Failed to format token balance:', error);
    return balance;
  }
};

export const parseAmount = (amount: string, decimals: number): string => {
  try {
    const [whole, fraction = ''] = amount.split('.');
    const paddedFraction = fraction.padEnd(decimals, '0');
    return whole + paddedFraction;
  } catch (error) {
    throw new Error('Invalid amount format', { cause: error });
  }
};

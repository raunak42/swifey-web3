import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

export default function WalletScreen() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get the development scheme
  const getRedirectUrl = () => {
    // In development, use the Expo development scheme
    if (__DEV__) {
      return 'exp+swifey-web3://expo-development-client';
    }
    // In production, use your app's scheme
    return 'swifey://phantom';
  };

  useEffect(() => {
    // Set up deep link listener when component mounts
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Cleanup listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);

  const connectPhantom = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const phantomURL = Platform.OS === 'ios' 
        ? 'phantom://'
        : 'https://phantom.app';

      const supported = await Linking.canOpenURL(phantomURL);
      
      if (!supported) {
        setError('Please install Phantom Wallet to continue');
        const storeUrl = Platform.OS === 'ios'
          ? 'https://apps.apple.com/us/app/phantom-crypto-wallet/id1598432977'
          : 'https://play.google.com/store/apps/details?id=app.phantom';
        await Linking.openURL(storeUrl);
        return;
      }

      // Create a random nonce
      const nonce = Array.from(await Crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const redirectUrl = getRedirectUrl();
      console.log('Redirect URL:', redirectUrl); // For debugging

      // Create the connection URL with testnet cluster
      const url = `phantom://ul/v1/connect?` + 
        `app_url=${encodeURIComponent(redirectUrl)}` +
        `&dapp_encryption_public_key=${nonce}` +
        `&redirect_url=${encodeURIComponent(redirectUrl)}` +
        `&cluster=testnet`; // Using testnet for development

      console.log('Phantom URL:', url); // For debugging

      await Linking.openURL(url);

    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeepLink = async (event: { url: string }) => {
    try {
      const { url } = event;
      console.log('Received deep link:', url); // For debugging

      // Verify this is a Phantom response
      if (!url.includes('phantom')) {
        return;
      }

      // Parse the URL and extract data
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      // Get the phantom data
      const phantomData = params.get('phantom_encryption_public_key');
      const addressData = params.get('data');
      
      if (!phantomData || !addressData) {
        throw new Error('Invalid response from Phantom');
      }

      // Decode the wallet address
      const walletAddress = decodeURIComponent(addressData);
      console.log('Wallet address:', walletAddress);

      setWalletAddress(walletAddress);
      
      // Update the database
      await updateUserWallet(walletAddress);

    } catch (error) {
      console.error('Error handling deep link:', error);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const copyAddressToClipboard = async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet Connection</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!walletAddress ? (
        <TouchableOpacity
          style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
          onPress={connectPhantom}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.connectButtonText}>Connect Phantom Wallet</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.walletInfoContainer}>
          <Text style={styles.walletLabel}>Connected Wallet:</Text>
          <TouchableOpacity onPress={copyAddressToClipboard}>
            <Text style={styles.walletAddress}>
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </Text>
          </TouchableOpacity>
          <Text style={styles.copyHint}>Tap to copy address</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  connectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  walletInfoContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  copyHint: {
    fontSize: 12,
    color: '#999',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
});

// Helper function to extract address from deep link URL
function extractAddressFromUrl(url: string): string | null {
  // Implement based on Phantom's response format
  // This is a placeholder - you'll need to parse the actual URL structure
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('wallet_address');
  } catch {
    return null;
  }
}

// Helper function to update user's wallet address in the database
async function updateUserWallet(address: string) {
  // Implement your database update logic here
  // You'll need to identify the current user and update their wallet address
  try {
    const response = await fetch('http://192.168.74.111:8081/api/updateWallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress: address }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update wallet address');
    }
  } catch (error) {
    console.error('Error updating wallet:', error);
    throw error;
  }
}

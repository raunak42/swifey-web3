import React, { useState, useEffect } from "react";
import { View, Text, Button, Linking } from "react-native";
import { ReclaimProofRequest } from "@reclaimprotocol/reactnative-sdk";

const APP_ID = "0x800b359BB58E951E6F8a968e7Bd93e61e71a370c";
const APP_SECRET = "0xdf73886d185b95b9ef8861da2351de00674f71225659a7b163afd746954e7c55";
const PROVIDER_ID = "a09df809-ea2d-4413-ab2f-0d83689e388d";

async function initializeReclaim() {
  try {
    console.log('Initializing Reclaim with:', { APP_ID, PROVIDER_ID });
    const reclaimProofRequest = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      PROVIDER_ID
    );
    console.log('Reclaim initialized successfully');
    return reclaimProofRequest;
  } catch (error: unknown) {
    console.error('Reclaim initialization error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error(`Failed to initialize Reclaim: ${error.message}`);
    }
    throw new Error(`Failed to initialize Reclaim: ${String(error)}`);
  }
}

async function generateRequestUrl(reclaimProofRequest: ReclaimProofRequest) {
  const requestUrl = await reclaimProofRequest.getRequestUrl();
  console.log("Request URL:", requestUrl);
  return requestUrl;
}

async function startVerificationSession(
  reclaimProofRequest: ReclaimProofRequest,
  onSuccess: (proofs: any) => void,
  onError: (error: Error) => void
) {
  await reclaimProofRequest.startSession({
    onSuccess: onSuccess,
    onError: onError,
  });
}

export default function ReclaimDemo() {
    const [requestUrl, setRequestUrl] = useState('');
    const [status, setStatus] = useState('Initializing...');
    const [verifiedUsername, setVerifiedUsername] = useState<string | null>(null);
   
    useEffect(() => {
      const subscription = Linking.addEventListener('url', ({ url }) => {
        if (url.includes('reclaim-callback')) {
          console.log('Redirected back to app:', url);
          const urlParams = new URLSearchParams(url.split('?')[1]);
          const proofParams = urlParams.get('proofs');
          if (proofParams) {
            try {
              const proofs = JSON.parse(decodeURIComponent(proofParams));
              console.log('Parsed proofs:', proofs);
              const username = proofs?.credentials?.[0]?.provider?.username || 
                              proofs?.claimData?.context?.username ||
                              proofs?.parameters?.username;
              if (username) {
                setVerifiedUsername(username);
                setStatus('Verification successful!');
              } else {
                console.log('Username not found in proof structure:', proofs);
                setStatus('Username not found in verification data');
              }
            } catch (error) {
              console.error('Error parsing proof data:', error);
              setStatus('Error processing verification result');
            }
          }
        }
      });
   
      async function setup() {
        try {
          setStatus('Starting initialization...');
          const reclaimProofRequest = await initializeReclaim();
          
          setStatus('Generating request URL...');
          const url = await generateRequestUrl(reclaimProofRequest);
          setRequestUrl(url);
          setStatus('Ready to start verification');
   
          await startVerificationSession(
            reclaimProofRequest,
            (proofs) => {
              console.log('Received proofs:', proofs);
              if (proofs) {
                if (typeof proofs === 'string') {
                  console.log('SDK Message:', proofs);
                } else if (typeof proofs !== 'string') {
                  const username = proofs?.claimData?.context?.username;
                  console.log('Proof received:', username);
                  setVerifiedUsername(username);
                  setStatus('Verification successful!');
                }
              }
            },
            (error) => {
              console.error('Verification error:', error);
              setStatus(`Error: ${error.message}`);
            }
          );
        } catch (error: unknown) {
          console.error('Setup failed:', error);
          setStatus(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
   
      setup();
   
      return () => {
        subscription.remove();
      };
    }, []);
   
    const openRequestUrl = () => {
      if (requestUrl) {
        Linking.openURL(requestUrl);
      }
    };
   
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Reclaim Demo</Text>
        <Text style={{ fontSize: 18, color: 'green' }}>Status: {status}</Text>
        {requestUrl && !verifiedUsername && (
          <Button title="Start Verification" onPress={openRequestUrl} />
        )}
        {verifiedUsername && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18 }}>
              Verified Twitter Username: {verifiedUsername}
            </Text>
          </View>
        )}
      </View>
    );
  }
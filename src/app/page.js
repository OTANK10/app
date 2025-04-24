// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import bleScanner from '../components/BLEScanner';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    if (!isMounted) return;
    
    // Check if Web Bluetooth is available
    const isBluetoothAvailable = typeof navigator !== 'undefined' && 
                               typeof navigator.bluetooth !== 'undefined';
    
    if (!isBluetoothAvailable) {
      setStatus('Web Bluetooth is not available in this browser');
    }
    
    // Simple event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setStatus('Connected to device');
    };
    
    const handleDisconnected = () => {
      setIsConnected(false);
      setStatus('Disconnected from device');
    };
    
    const handleError = ({ error }) => {
      setStatus(`Error: ${error.message}`);
      setError(error.message);
      setIsConnecting(false);
    };
    
    // Add event listeners
    bleScanner.on('connected', handleConnected);
    bleScanner.on('disconnected', handleDisconnected);
    bleScanner.on('error', handleError);
    
    // Cleanup on unmount
    return () => {
      bleScanner.removeListener('connected', handleConnected);
      bleScanner.removeListener('disconnected', handleDisconnected);
      bleScanner.removeListener('error', handleError);
    };
  }, [isMounted]);

  // Simple connect function
  async function connectToDevice() {
    try {
      setStatus('Connecting...');
      setIsConnecting(true);
      setError(null);
      
      await bleScanner.scanAndConnect();
    } catch (error) {
      setStatus(`Connection error: ${error.message}`);
      setIsConnecting(false);
    }
  }

  // Disconnect function
  function disconnectDevice() {
    bleScanner.disconnect();
    setStatus('Disconnecting...');
  }

  // Set MIDI mode
  async function setMidiMode() {
    try {
      setStatus('Switching to MIDI mode...');
      await bleScanner.setMidiMode();
      setStatus('Switched to MIDI mode');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  }

  // Set HID mode
  async function setHidMode() {
    try {
      setStatus('Switching to HID mode...');
      await bleScanner.setHidMode();
      setStatus('Switched to HID mode');
      router.push('/hid');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  }

  // Initial render for SSR
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black p-8 flex flex-col items-center justify-start">
        <Header links={['HID']} />
        <h1 className="text-4xl font-bold text-white mb-4">Neely33 Music Shoe</h1>
        <p className="text-white mb-6">Connect your music shoes and start creating!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8 flex flex-col items-center justify-start">
      {/* Header */}
      <Header links={['HID']} />
      
      <h1 className="text-4xl font-bold text-white mb-4">Neely33 Music Shoe</h1>
      <p className="text-white mb-6">Connect your music shoes and start creating!</p>
      
      {/* Connection Status */}
      <div className="mb-4 text-white flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>Shoe: {isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      
      {/* Status Message */}
      {status && <p className="mb-4 text-sm text-green-400">{status}</p>}
      
      {/* Error Message */}
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      
      {/* Connect/Disconnect Button */}
      <button
        onClick={isConnected ? disconnectDevice : connectToDevice}
        className={`${isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white p-3 rounded mb-6`}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect to Shoe'}
      </button>
      
      {/* Mode Selection (only shown when connected) */}
      {isConnected && (
        <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
          <button
            onClick={setMidiMode}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded"
          >
            MIDI Mode
          </button>
          <button
            onClick={setHidMode}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded"
          >
            HID Mode
          </button>
        </div>
      )}
    </div>
  );
}
// src/app/context/NeelyContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import bleScanner from '../../components/BLEScanner';

// Create context
const NeelyContext = createContext(null);

// Context provider component
export const NeelyProvider = ({ children }) => {
  // Use try-catch to prevent hydration errors
  try {
    const [isConnected, setIsConnected] = useState(false);
    const [mode, setMode] = useState('midi'); // 'midi' or 'hid'
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    
    // Set up connection listeners
    useEffect(() => {
      // Mark component as mounted to avoid hydration issues
      setIsMounted(true);
      
      // Skip client-side setup during SSR
      if (!isMounted) return;
      
      try {
        // Listen for connection events
        const handleConnected = () => {
          setIsConnected(true);
          setStatus('Connected to shoe');
        };
        
        // Listen for disconnection events
        const handleDisconnected = () => {
          setIsConnected(false);
          setStatus('Disconnected from shoe');
        };
        
        // Listen for errors
        const handleError = ({ error }) => {
          setStatus(`Error: ${error.message}`);
          setError(error.message);
        };
        
        // Add event listeners
        bleScanner.on('connected', handleConnected);
        bleScanner.on('disconnected', handleDisconnected);
        bleScanner.on('error', handleError);
        
        // Initial connection check
        setIsConnected(bleScanner.isConnected());
      } catch (e) {
        console.error("Error setting up Neely context:", e);
      }
      
      // Cleanup listeners on unmount
      return () => {
        try {
          bleScanner.removeListener('connected', handleConnected);
          bleScanner.removeListener('disconnected', handleDisconnected);
          bleScanner.removeListener('error', handleError);
        } catch (e) {
          console.error("Error cleaning up Neely context listeners:", e);
        }
      };
    }, [isMounted]);
    
    // Switch to MIDI mode
    const switchToMidiMode = async () => {
      try {
        const success = await bleScanner.setMidiMode();
        if (success) {
          setMode('midi');
          setStatus('Switched to MIDI mode');
          return true;
        } else {
          throw new Error('Failed to switch to MIDI mode');
        }
      } catch (error) {
        setStatus(`Error switching to MIDI mode: ${error.message}`);
        setError(error.message);
        return false;
      }
    };
    
    // Switch to HID mode
    const switchToHidMode = async () => {
      try {
        const success = await bleScanner.setHidMode();
        if (success) {
          setMode('hid');
          setStatus('Switched to HID mode');
          return true;
        } else {
          throw new Error('Failed to switch to HID mode');
        }
      } catch (error) {
        setStatus(`Error switching to HID mode: ${error.message}`);
        setError(error.message);
        return false;
      }
    };
    
    // Connect to device
    const connect = async () => {
      try {
        setStatus('Connecting to shoe...');
        return await bleScanner.scanAndConnect();
      } catch (error) {
        setStatus(`Connection error: ${error.message}`);
        setError(error.message);
        return false;
      }
    };
    
    // Disconnect from device
    const disconnect = () => {
      try {
        bleScanner.disconnect();
        setStatus('Disconnected from shoe');
        return true;
      } catch (error) {
        setStatus(`Disconnect error: ${error.message}`);
        setError(error.message);
        return false;
      }
    };
    
    // Value object to provide through context
    const contextValue = {
      isConnected,
      mode,
      status,
      error,
      connect,
      disconnect,
      switchToMidiMode,
      switchToHidMode,
      clearError: () => setError(null),
      clearStatus: () => setStatus('')
    };
    
    return (
      <NeelyContext.Provider value={contextValue}>
        {children}
      </NeelyContext.Provider>
    );
  } catch (error) {
    // Fallback in case of error
    console.error("Error in NeelyProvider:", error);
    
    // Return children without context if there's an error
    return children;
  }
};

// Custom hook for using the context
export const useNeely = () => {
  const context = useContext(NeelyContext);
  if (!context) {
    throw new Error('useNeely must be used within a NeelyProvider');
  }
  return context;
};

export default NeelyContext;
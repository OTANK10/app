// src/app/hid/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import bleScanner from '../../components/BLEScanner';

export default function HIDPage() {
  const [keyMappings, setKeyMappings] = useState({
    'tilt-up': 87,    // W
    'tilt-down': 83,  // S
    'roll-left': 65,  // A
    'roll-right': 68  // D
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('');
  const [recordingRegion, setRecordingRegion] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Initialize on component mount
  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
    if (!isMounted) return;
    
    // Set up connection listeners
    const handleConnected = () => {
      setIsConnected(true);
      setStatus('Connected to shoe');
    };
    
    const handleDisconnected = () => {
      setIsConnected(false);
      setStatus('Disconnected from shoe');
    };
    
    const handleError = ({ error }) => {
      setStatus(`Error: ${error.message}`);
    };
    
    bleScanner.on('connected', handleConnected);
    bleScanner.on('disconnected', handleDisconnected);
    bleScanner.on('error', handleError);
    
    // Check initial connection status
    setIsConnected(bleScanner.isConnected());
    
    // Ensure shoe is in HID mode
    if (bleScanner.isConnected()) {
      bleScanner.setHidMode()
        .then(() => {
          console.log('Set shoe to HID mode');
          setStatus('Shoe is in HID mode');
        })
        .catch(error => {
          console.error('Error setting HID mode:', error);
          setStatus(`Error setting HID mode: ${error.message}`);
        });
    }
    
    // Key press listener for recording
    const handleKeyDown = (event) => {
      if (recordingRegion) {
        event.preventDefault();
        const keyCode = event.keyCode;
        
        // Update mapping
        setKeyMappings(prev => ({
          ...prev,
          [recordingRegion]: keyCode
        }));
        
        console.log(`Mapping ${recordingRegion} to key: ${getKeyName(keyCode)} (${keyCode})`);
        
        // Send to device
        const keyIndex = getKeyIndexForRegion(recordingRegion);
        if (keyIndex && isConnected) {
          // Format: setKeymap:index:value
          bleScanner.sendCommand(`setKeymap:${keyIndex}:${keyCode}`)
            .then(() => {
              setStatus(`Mapped ${recordingRegion} to ${getKeyName(keyCode)}`);
              console.log(`Key mapping command sent successfully`);
            })
            .catch(error => {
              setStatus(`Error mapping key: ${error.message}`);
              console.log(`Key mapping error: ${error.message}`);
            });
        }
        
        // Stop recording
        setRecordingRegion(null);
      }
    };
    
    if (recordingRegion) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      // Clean up listeners
      bleScanner.removeListener('connected', handleConnected);
      bleScanner.removeListener('disconnected', handleDisconnected);
      bleScanner.removeListener('error', handleError);
      
      if (recordingRegion) {
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [recordingRegion, isConnected, isMounted]);

  // Navigate to home
  const goToConnect = () => {
    router.push('/');
  };

  // Handle region click for key assignment
  const handleRegionClick = (region) => {
    if (!isConnected) {
      setStatus(`Please connect to the shoe first`);
      return;
    }
    
    setRecordingRegion(region);
    setStatus(`Press a key to assign to ${region}...`);
  };

  // Get key index for sending to device
  const getKeyIndexForRegion = (region) => {
    switch(region) {
      case 'tilt-up': return 1;
      case 'tilt-down': return 2;
      case 'roll-left': return 3;
      case 'roll-right': return 4;
      default: return null;
    }
  };

  // Get key name for display
  const getKeyName = (keyCode) => {
    // Basic mapping of keycodes to names
    const keyNames = {
      8: 'Backspace', 9: 'Tab', 13: 'Enter', 16: 'Shift', 17: 'Ctrl', 18: 'Alt', 19: 'Pause',
      20: 'Caps Lock', 27: 'Esc', 32: 'Space', 33: 'Page Up', 34: 'Page Down', 35: 'End',
      36: 'Home', 37: '←', 38: '↑', 39: '→', 40: '↓', 45: 'Insert', 46: 'Delete',
      48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9',
      65: 'A', 66: 'B', 67: 'C', 68: 'D', 69: 'E', 70: 'F', 71: 'G', 72: 'H', 73: 'I',
      74: 'J', 75: 'K', 76: 'L', 77: 'M', 78: 'N', 79: 'O', 80: 'P', 81: 'Q', 82: 'R',
      83: 'S', 84: 'T', 85: 'U', 86: 'V', 87: 'W', 88: 'X', 89: 'Y', 90: 'Z',
      91: 'Win', 93: 'Menu', 96: 'Num 0', 97: 'Num 1', 98: 'Num 2', 99: 'Num 3',
      100: 'Num 4', 101: 'Num 5', 102: 'Num 6', 103: 'Num 7', 104: 'Num 8', 105: 'Num 9',
      106: 'Num *', 107: 'Num +', 109: 'Num -', 110: 'Num .', 111: 'Num /',
      112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
      118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
      186: ';', 187: '=', 188: ',', 189: '-', 190: '.', 191: '/', 192: '`',
      219: '[', 220: '\\', 221: ']', 222: '\''
    };
    
    return keyNames[keyCode] || `Key ${keyCode}`;
  };

  // Render client-side only content to avoid hydration errors
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-black p-8 flex flex-col items-center justify-start">
        <Header links={['Home']} />
        <h1 className="text-2xl font-bold text-white mb-4">HID Key Mapping</h1>
        <p className="text-white mb-6">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8 flex flex-col items-center justify-start">
      <Header links={['Home']} />

      <h1 className="text-2xl font-bold text-white mb-4">HID Key Mapping</h1>
      
      {/* Connection Status */}
      <div className="mb-4 text-white flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>Shoe: {isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      
      {!isConnected && (
        <button 
          onClick={goToConnect} 
          className="mb-4 bg-blue-500 p-2 rounded text-white"
        >
          Return to Connect Page
        </button>
      )}
      
      {/* Status Message */}
      {status && <p className="mb-4 text-sm text-green-400">{status}</p>}
      
      {/* Recording Status */}
      {recordingRegion && (
        <div className="mb-4 py-2 px-4 bg-red-600 text-white rounded-full animate-pulse">
          Press any key to assign to {recordingRegion}
        </div>
      )}

      {/* Shoe Visualization with Key Mappings */}
      <div className="mb-8 w-full max-w-md">
        <div className="relative w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          {/* Shoe outline */}
          <div className="w-32 h-48 bg-gray-700 rounded-xl relative">
            {/* Tilt Up */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 
                        bg-gray-600 hover:bg-blue-600 flex items-center justify-center rounded cursor-pointer"
              onClick={() => handleRegionClick('tilt-up')}
            >
              <span className="text-white text-xs mb-4">Tilt Up</span>
              <span className="absolute text-white font-bold">{getKeyName(keyMappings['tilt-up'])}</span>
            </div>
            
            {/* Tilt Down */}
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-16 h-16 
                        bg-gray-600 hover:bg-blue-600 flex items-center justify-center rounded cursor-pointer"
              onClick={() => handleRegionClick('tilt-down')}
            >
              <span className="text-white text-xs mt-4">Tilt Down</span>
              <span className="absolute text-white font-bold">{getKeyName(keyMappings['tilt-down'])}</span>
            </div>
            
            {/* Roll Left */}
            <div 
              className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 
                        bg-gray-600 hover:bg-blue-600 flex items-center justify-center rounded cursor-pointer"
              onClick={() => handleRegionClick('roll-left')}
            >
              <span className="text-white text-xs mr-4">Roll Left</span>
              <span className="absolute text-white font-bold">{getKeyName(keyMappings['roll-left'])}</span>
            </div>
            
            {/* Roll Right */}
            <div 
              className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-16 h-16 
                        bg-gray-600 hover:bg-blue-600 flex items-center justify-center rounded cursor-pointer"
              onClick={() => handleRegionClick('roll-right')}
            >
              <span className="text-white text-xs ml-4">Roll Right</span>
              <span className="absolute text-white font-bold">{getKeyName(keyMappings['roll-right'])}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Mapping List */}
      <div className="mb-8 w-full max-w-md">
        <h2 className="text-white text-lg mb-4">
          Current Key Mappings:
        </h2>
        <div className="grid grid-cols-2 gap-4 bg-gray-900 p-4 rounded">
          <div className="flex justify-between p-2 border border-gray-700 rounded">
            <span className="text-white">Tilt Up:</span>
            <button 
              onClick={() => handleRegionClick('tilt-up')} 
              className="px-3 rounded bg-blue-600"
              disabled={!isConnected}
            >
              {getKeyName(keyMappings['tilt-up'])}
            </button>
          </div>
          <div className="flex justify-between p-2 border border-gray-700 rounded">
            <span className="text-white">Tilt Down:</span>
            <button 
              onClick={() => handleRegionClick('tilt-down')} 
              className="px-3 rounded bg-blue-600"
              disabled={!isConnected}
            >
              {getKeyName(keyMappings['tilt-down'])}
            </button>
          </div>
          <div className="flex justify-between p-2 border border-gray-700 rounded">
            <span className="text-white">Roll Left:</span>
            <button 
              onClick={() => handleRegionClick('roll-left')} 
              className="px-3 rounded bg-blue-600"
              disabled={!isConnected}
            >
              {getKeyName(keyMappings['roll-left'])}
            </button>
          </div>
          <div className="flex justify-between p-2 border border-gray-700 rounded">
            <span className="text-white">Roll Right:</span>
            <button 
              onClick={() => handleRegionClick('roll-right')} 
              className="px-3 rounded bg-blue-600"
              disabled={!isConnected}
            >
              {getKeyName(keyMappings['roll-right'])}
            </button>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="mt-4 text-gray-400 text-center max-w-md">
        <h3 className="text-white font-bold mb-2">Instructions:</h3>
        <p className="mb-2">
          Click on any of the direction squares or buttons to remap the key for that action. 
          When prompted, press the key on your keyboard that you want to use.
        </p>
        <ul className="text-left list-disc pl-5 space-y-1 mb-4">
          <li>Tilt Up: Tilting the front of your foot upward</li>
          <li>Tilt Down: Tilting the front of your foot downward</li>
          <li>Roll Left: Rolling your foot to the left</li>
          <li>Roll Right: Rolling your foot to the right</li>
        </ul>
        <p className="text-sm">
          Return to the home screen to switch between MIDI and HID modes.
        </p>
      </div>
    </div>
  );
}
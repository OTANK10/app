// src/app/gesture-setup/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import { useNeely } from '../context/NeelyContext';

export default function GestureSetup() {
  const { 
    isConnected, 
    scanAndConnect, 
    currentSensorData,
    status: contextStatus
  } = useNeely();
  
  const [selectedGesture, setSelectedGesture] = useState(null);
  const [gestureName, setGestureName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const gestures = ['Front Tilt', 'Back Tilt', 'Left Tilt', 'Right Tilt'];
  
  // Update status from context
  useEffect(() => {
    if (contextStatus) {
      setStatus(contextStatus);
    }
  }, [contextStatus]);

  // Start Recording Gesture
  const startRecording = () => {
    if (!selectedGesture && !gestureName) {
      return alert('Please select or name a gesture first.');
    }
    
    if (!isConnected) {
      return alert('Please connect to the shoe first.');
    }
    
    const name = gestureName || selectedGesture;
    setIsRecording(true);
    setStatus(`Recording gesture: ${name}...`);
    
    // Auto-stop after 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      setStatus(`✅ Gesture "${name}" recorded!`);
    }, 3000);
  };

  // Handle Gesture Selection
  const handleGestureSelection = (gesture) => {
    setSelectedGesture(gesture);
    setStatus(''); // Clear previous status message
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <Header links={['HID', 'How to Use', 'About Us']} />
      
      <h1 className="text-2xl font-bold">Gesture Configuration</h1>
      
      {/* Connection Status */}
      <div className="mt-4 flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        {!isConnected && (
          <button 
            onClick={scanAndConnect} 
            className="ml-4 bg-blue-500 p-2 rounded text-sm"
          >
            Connect Shoe
          </button>
        )}
      </div>

      {/* Status Message */}
      {status && <p className="mt-2 text-sm text-green-400">{status}</p>}

      {/* Gesture Selection */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {gestures.map((gesture, index) => (
          <div
            key={index}
            className={`w-24 h-24 border-2 cursor-pointer flex items-center justify-center text-center p-2 ${
              selectedGesture === gesture ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600'
            }`}
            onClick={() => handleGestureSelection(gesture)}
          >
            {gesture}
          </div>
        ))}
      </div>

      {/* Gesture Name Input */}
      <div className="mt-6 flex items-center">
        <label>Custom Gesture Name:</label>
        <input 
          type="text" 
          className="text-black p-2 ml-2" 
          value={gestureName} 
          onChange={(e) => setGestureName(e.target.value)} 
          placeholder="e.g., Kick"
        />
      </div>

      {/* Record Gesture Button */}
      <button 
        onClick={startRecording} 
        className={`mt-6 p-3 rounded ${
          isRecording ? 'bg-red-700 animate-pulse' : 'bg-red-500'
        }`}
        disabled={isRecording || (!selectedGesture && !gestureName) || !isConnected}
      >
        {isRecording ? 'Recording...' : 'Record Selected Gesture'}
      </button>
      
      {/* Sensor Data Visualization */}
      {isConnected && (
        <div className="mt-8 w-full max-w-md bg-gray-900 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Live Sensor Data</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Roll: {currentSensorData.roll.toFixed(2)}°</p>
              <p>Pitch: {currentSensorData.pitch.toFixed(2)}°</p>
              <p>Yaw: {currentSensorData.yaw.toFixed(2)}°</p>
              <p>Front Pressure: {currentSensorData.frontPressure.toFixed(2)}</p>
            </div>
            <div>
              <p>X Accel: {currentSensorData.xAccel.toFixed(2)} m/s²</p>
              <p>Y Accel: {currentSensorData.yAccel.toFixed(2)} m/s²</p>
              <p>Z Accel: {currentSensorData.zAccel.toFixed(2)} m/s²</p>
              <p>Rear Pressure: {currentSensorData.rearPressure.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home */}
      <div className="mt-6">
        <Link href="/">
          <button className="bg-blue-500 text-white p-2 rounded">Back to Home</button>
        </Link>
      </div>
    </div>
  );
}
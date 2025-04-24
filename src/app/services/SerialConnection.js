// src/app/services/SerialConnection.js
import { EventEmitter } from 'events';

class SerialConnection extends EventEmitter {
  constructor() {
    super();
    this.leftPort = null;
    this.rightPort = null;
    this.leftReader = null;
    this.rightReader = null;
    this.leftWriter = null;
    this.rightWriter = null;
    this.connectionStatus = {
      left: false,
      right: false
    };
    this.readLoopActive = {
      left: false,
      right: false
    };
  }

  // Check if Web Serial API is available
  isSupported() {
    return 'serial' in navigator;
  }

  // Request a port to be assigned to a specific shoe
  async requestPort(side) {
    if (!side || (side !== 'left' && side !== 'right')) {
      throw new Error('Invalid side specified (must be "left" or "right")');
    }

    try {
      // Request a serial port from the user
      const port = await navigator.serial.requestPort();
      
      // Store the port for the specified side
      if (side === 'left') {
        this.leftPort = port;
      } else {
        this.rightPort = port;
      }
      
      console.log(`Selected port for ${side} shoe`);
      return true;
    } catch (error) {
      console.error(`Error selecting port for ${side} shoe:`, error);
      this.emit('error', { side, error });
      return false;
    }
  }

  // Connect to a specific shoe
  async connect(side) {
    if (!side || (side !== 'left' && side !== 'right')) {
      throw new Error('Invalid side specified (must be "left" or "right")');
    }

    const port = side === 'left' ? this.leftPort : this.rightPort;
    
    if (!port) {
      throw new Error(`No port selected for ${side} shoe`);
    }

    try {
      // Open the selected port with appropriate settings for your Nordic device
      await port.open({ 
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        bufferSize: 4096
      });
      
      console.log(`Connected to ${side} shoe via serial port`);
      
      // Set up the reader and writer
      if (side === 'left') {
        this.leftReader = port.readable.getReader();
        this.leftWriter = port.writable.getWriter();
      } else {
        this.rightReader = port.readable.getReader();
        this.rightWriter = port.writable.getWriter();
      }
      
      // Update connection status
      this.connectionStatus[side] = true;
      this.emit('connected', side);
      
      // Start reading from the port
      this.startReading(side);
      
      return true;
    } catch (error) {
      console.error(`Error connecting to ${side} shoe:`, error);
      this.emit('error', { side, error });
      return false;
    }
  }

  // Start reading data from a specific shoe
  async startReading(side) {
    if (!side || (side !== 'left' && side !== 'right')) {
      throw new Error('Invalid side specified (must be "left" or "right")');
    }

    const reader = side === 'left' ? this.leftReader : this.rightReader;
    
    if (!reader) {
      throw new Error(`No reader available for ${side} shoe`);
    }

    this.readLoopActive[side] = true;

    try {
      // Set up buffer for received data
      let buffer = '';
      
      // Listen for incoming data
      while (this.readLoopActive[side]) {
        const { value, done } = await reader.read();
        
        if (done) {
          // Reader has been canceled
          break;
        }
        
        // Convert Uint8Array to string and add to buffer
        const decoder = new TextDecoder();
        const text = decoder.decode(value);
        buffer += text;
        
        // Process complete messages (assuming messages end with newline)
        // Adjust this based on your Nordic device's message format
        const messages = buffer.split('\n');
        
        // Save the last incomplete message (if any) back to the buffer
        buffer = messages.pop() || '';
        
        // Process complete messages
        for (const message of messages) {
          if (message.trim().length > 0) {
            // Emit the received data
            this.emit('data', { side, data: message.trim() });
          }
        }
      }
    } catch (error) {
      console.error(`Error reading from ${side} shoe:`, error);
      this.emit('error', { side, error });
      
      // Update connection status if read error occurs
      this.connectionStatus[side] = false;
      this.emit('disconnected', side);
    }
  }

  // Send a command to a specific shoe
  async sendCommand(command, side) {
    if (!side || (side !== 'left' && side !== 'right')) {
      throw new Error('Invalid side specified (must be "left" or "right")');
    }

    const writer = side === 'left' ? this.leftWriter : this.rightWriter;
    
    if (!writer) {
      throw new Error(`No writer available for ${side} shoe`);
    }

    if (!this.connectionStatus[side]) {
      throw new Error(`Not connected to ${side} shoe`);
    }

    try {
      // Convert string to Uint8Array (add newline for message termination)
      const encoder = new TextEncoder();
      const data = encoder.encode(command + '\n');
      
      // Send the data
      await writer.write(data);
      console.log(`Command sent to ${side} shoe:`, command);
      return true;
    } catch (error) {
      console.error(`Error sending command to ${side} shoe:`, error);
      this.emit('error', { side, error });
      return false;
    }
  }

  // Disconnect from a specific shoe
  async disconnect(side) {
    if (!side || (side !== 'left' && side !== 'right')) {
      throw new Error('Invalid side specified (must be "left" or "right")');
    }

    try {
      // Stop the read loop
      this.readLoopActive[side] = false;
      
      // Release reader
      if (side === 'left' && this.leftReader) {
        await this.leftReader.cancel();
        await this.leftReader.releaseLock();
        this.leftReader = null;
      } else if (side === 'right' && this.rightReader) {
        await this.rightReader.cancel();
        await this.rightReader.releaseLock();
        this.rightReader = null;
      }
      
      // Release writer
      if (side === 'left' && this.leftWriter) {
        await this.leftWriter.releaseLock();
        this.leftWriter = null;
      } else if (side === 'right' && this.rightWriter) {
        await this.rightWriter.releaseLock();
        this.rightWriter = null;
      }
      
      // Close port
      if (side === 'left' && this.leftPort) {
        await this.leftPort.close();
        this.leftPort = null;
      } else if (side === 'right' && this.rightPort) {
        await this.rightPort.close();
        this.rightPort = null;
      }
      
      // Update connection status
      this.connectionStatus[side] = false;
      this.emit('disconnected', side);
      
      console.log(`Disconnected from ${side} shoe`);
      return true;
    } catch (error) {
      console.error(`Error disconnecting from ${side} shoe:`, error);
      this.emit('error', { side, error });
      
      // Force update connection status even if there was an error
      this.connectionStatus[side] = false;
      this.emit('disconnected', side);
      
      return false;
    }
  }

  // Disconnect from both shoes
  async disconnectAll() {
    const results = await Promise.allSettled([
      this.isConnected('left') ? this.disconnect('left') : Promise.resolve(true),
      this.isConnected('right') ? this.disconnect('right') : Promise.resolve(true)
    ]);
    
    return results.every(result => result.status === 'fulfilled' && result.value === true);
  }

  // Check if a specific shoe is connected
  isConnected(side) {
    if (!side || (side !== 'left' && side !== 'right')) {
      return false;
    }
    return this.connectionStatus[side];
  }

  // Check if any shoe is connected
  isAnyConnected() {
    return this.connectionStatus.left || this.connectionStatus.right;
  }

  // Get connection status for both shoes
  getConnectionStatus() {
    return this.connectionStatus;
  }

  // Set MIDI mode for a specific shoe
  async setMidiMode(side) {
    return this.sendCommand('mode:midi', side);
  }

  // Set HID mode for a specific shoe
  async setHidMode(side) {
    return this.sendCommand('mode:hid', side);
  }

  // Set MIDI mode for both shoes
  async setMidiModeAll() {
    const results = await Promise.allSettled([
      this.isConnected('left') ? this.setMidiMode('left') : Promise.resolve(false),
      this.isConnected('right') ? this.setMidiMode('right') : Promise.resolve(false)
    ]);
    
    return results.some(result => result.status === 'fulfilled' && result.value === true);
  }

  // Set HID mode for both shoes
  async setHidModeAll() {
    const results = await Promise.allSettled([
      this.isConnected('left') ? this.setHidMode('left') : Promise.resolve(false),
      this.isConnected('right') ? this.setHidMode('right') : Promise.resolve(false)
    ]);
    
    return results.some(result => result.status === 'fulfilled' && result.value === true);
  }

  // Set a key mapping for a specific shoe
  async setKeyMapping(keyIndex, keyCode, side) {
    return this.sendCommand(`setKeymap:${keyIndex}:${keyCode}`, side);
  }
}

// Create and export a singleton instance
const serialConnection = new SerialConnection();
export default serialConnection;
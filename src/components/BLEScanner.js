// components/BLEScanner.js
import EventEmitter from 'events';

class BLEScanner extends EventEmitter {
  constructor() {
    super();
    this.device = null;
    this.server = null;
    this.service = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;
    this.connected = false;
    
    // Operation locks to prevent "GATT operation already in progress" error
    this.isOperationInProgress = false;
    this.operationQueue = [];
    
    // Service UUIDs for Nordic UART
    this.serviceUUIDs = {
      uart: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      rxCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // App -> Device (write)
      txCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // Device -> App (notify)
    };
  }

  // Helper method to execute operations sequentially
  async executeOperation(operation) {
    // If an operation is already in progress, queue this one
    if (this.isOperationInProgress) {
      return new Promise((resolve, reject) => {
        this.operationQueue.push(() => {
          operation().then(resolve).catch(reject);
        });
      });
    }

    // Mark operation as in progress
    this.isOperationInProgress = true;
    
    try {
      // Execute the operation
      const result = await operation();
      this.isOperationInProgress = false;
      
      // Process next operation in queue if any
      if (this.operationQueue.length > 0) {
        const nextOperation = this.operationQueue.shift();
        nextOperation();
      }
      
      return result;
    } catch (error) {
      this.isOperationInProgress = false;
      
      // Process next operation in queue even if current one failed
      if (this.operationQueue.length > 0) {
        const nextOperation = this.operationQueue.shift();
        nextOperation();
      }
      
      throw error;
    }
  }

  // Scan for and connect to a device - simplified version
  async scanAndConnect() {
    return this.executeOperation(async () => {
      try {
        console.log('Starting scan for BLE devices');
        
        // Request any Bluetooth device with no filters
        this.device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [this.serviceUUIDs.uart]
        });
        
        if (!this.device) {
          throw new Error('No device selected');
        }
        
        console.log(`Device selected: ${this.device.name || 'Unknown'}`);
        
        // Connect to the device
        this.device.addEventListener('gattserverdisconnected', () => {
          console.log('Device disconnected');
          this.connected = false;
          this.emit('disconnected');
        });
        
        // Connect to GATT server
        console.log('Connecting to GATT server...');
        this.server = await this.device.gatt.connect();
        
        // Get the Nordic UART Service
        console.log('Getting UART service...');
        this.service = await this.server.getPrimaryService(this.serviceUUIDs.uart);
        
        // Get the RX and TX characteristics
        console.log('Getting characteristics...');
        this.rxCharacteristic = await this.service.getCharacteristic(this.serviceUUIDs.rxCharacteristic);
        this.txCharacteristic = await this.service.getCharacteristic(this.serviceUUIDs.txCharacteristic);
        
        // Start notifications on TX characteristic
        console.log('Starting notifications...');
        await this.txCharacteristic.startNotifications();
        this.txCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
          const value = event.target.value;
          const decoder = new TextDecoder('utf-8');
          const data = decoder.decode(value);
          console.log(`Received data: ${data}`);
          this.emit('data', { data });
        });
        
        // Wait for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.connected = true;
        console.log('Connected successfully!');
        this.emit('connected');
        
        return true;
      } catch (error) {
        console.error('Connection error:', error);
        this.emit('error', { error });
        return false;
      }
    });
  }

// Ultra simplified command sending with clean data
async sendCommand(command) {
  return this.executeOperation(async () => {
    if (!this.connected || !this.rxCharacteristic) {
      console.error('Cannot send command: Not connected');
      throw new Error('Not connected to device');
    }
    
    try {
      // Clean the command string and create exact-sized buffer
      const cleanCommand = command.trim();
      const encoder = new TextEncoder();
      const data = encoder.encode(cleanCommand);
      
      console.log(`Sending command: "${cleanCommand}" (${data.length} bytes)`);
      console.log(`Bytes: [${Array.from(data).map(b => b.toString(16)).join(', ')}]`);
      
      // Send the data with minimal processing
      await this.rxCharacteristic.writeValue(data);
      
      // Wait for the command to be processed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('Command sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      this.emit('error', { error });
      return false;
    }
  });
}

  // Set mode to MIDI
  async setMidiMode() {
    return await this.sendCommand("mode:midi");
  }

  // Set mode to HID 
  async setHidMode() {
    return await this.sendCommand("mode:hid");
  }

  // Disconnect from device
  async disconnect() {
    return this.executeOperation(async () => {
      try {
        if (this.device && this.device.gatt.connected) {
          this.device.gatt.disconnect();
        }
      } catch (error) {
        console.error('Error during disconnect:', error);
      } finally {
        this.connected = false;
        this.device = null;
        this.server = null;
        this.service = null;
        this.rxCharacteristic = null;
        this.txCharacteristic = null;
        
        this.emit('disconnected');
        return true;
      }
    });
  }

  // Check if connected
  isConnected() {
    return this.connected && this.device && this.device.gatt.connected;
  }
}

// Create singleton instance
const bleScanner = new BLEScanner();
export default bleScanner;
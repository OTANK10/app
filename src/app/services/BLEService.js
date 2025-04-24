// BLEService.js
export default class ShoeConnection {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;
    this.connected = false;
    
    // Service UUIDs matching your firmware
    this.serviceUUIDs = {
      // Nordic UART Service
      uart: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      rxCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // App -> Device (write)
      txCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e', // Device -> App (notify)
    };
    
    // Commands
    this.commands = {
      SET_MODE_HID: new TextEncoder().encode("mode:hid"),
      SET_MODE_MIDI: new TextEncoder().encode("mode:midi")
    };
  }

  async connect() {
    try {
      // Request device with Nordic UART Service UUID
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.serviceUUIDs.uart] }]
      });
      
      // Add event listener for disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.connected = false;
        console.log('Disconnected from device');
        // Dispatch disconnect event
        window.dispatchEvent(new CustomEvent('shoeDisconnected'));
      });
      
      // Connect to GATT server
      this.server = await this.device.gatt.connect();
      
      // Get the Nordic UART Service
      this.service = await this.server.getPrimaryService(this.serviceUUIDs.uart);
      
      // Get the RX and TX characteristics
      this.rxCharacteristic = await this.service.getCharacteristic(this.serviceUUIDs.rxCharacteristic);
      this.txCharacteristic = await this.service.getCharacteristic(this.serviceUUIDs.txCharacteristic);
      
      // Start notifications on TX characteristic (device to app)
      await this.txCharacteristic.startNotifications();
      this.txCharacteristic.addEventListener('characteristicvaluechanged', event => {
        const value = event.target.value;
        const message = new TextDecoder().decode(value);
        console.log('Received message:', message);
        // Dispatch event with received message
        window.dispatchEvent(new CustomEvent('shoeMessage', { 
          detail: { message }
        }));
      });
      
      this.connected = true;
      console.log('Connected to smart shoes');
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  async sendCommand(command) {
    if (!this.connected || !this.rxCharacteristic) {
      console.error('Not connected');
      return false;
    }
    
    try {
      await this.rxCharacteristic.writeValue(command);
      console.log('Command sent:', new TextDecoder().decode(command));
      return true;
    } catch (error) {
      console.error('Error sending command:', error);
      return false;
    }
  }
  
  async setModeHID() {
    return await this.sendCommand(this.commands.SET_MODE_HID);
  }

  async setModeMIDI() {
    return await this.sendCommand(this.commands.SET_MODE_MIDI);
  }

  // Add custom command function
  async sendCustomCommand(text) {
    const command = new TextEncoder().encode(text);
    return await this.sendCommand(command);
  }

  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.connected = false;
  }
}
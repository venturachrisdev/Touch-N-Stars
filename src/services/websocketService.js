class WebSocketService {
    constructor() {
      this.socket = null;
      this.listeners = new Map(); // Listener für Events
    }
  
    // WebSocket-Verbindung herstellen
    connect() {
      this.socket = new WebSocket("ws://192.168.2.128:1888/v2/socket");
  
      this.socket.onopen = () => {
        console.log("WebSocket verbunden.");
      };
  
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const eventName = message.Response?.Event;
  
        if (this.listeners.has(eventName)) {
          this.listeners.get(eventName)(message);
        }
      };
  
      this.socket.onerror = (error) => {
        console.error("WebSocket-Fehler:", error);
      };
  
      this.socket.onclose = () => {
        console.log("WebSocket geschlossen.");
      };
    }
  
    // Listener hinzufügen
    addListener(event, callback) {
      this.listeners.set(event, callback);
    }
  
    // Listener entfernen
    removeListener(event) {
      this.listeners.delete(event);
    }
  }
  
  const websocketService = new WebSocketService();
  export default websocketService;
  
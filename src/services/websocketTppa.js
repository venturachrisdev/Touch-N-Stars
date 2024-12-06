// services/websocketTppa.js

//IP von NINA ermitteln
const backendProtokol = "ws";
const backendPort = 1888;
const backendPfad ="/v2/tppa";
const backendUrl = `${backendProtokol}://${window.location.hostname}:${backendPort}${backendPfad}`;

console.log(backendUrl);


class WebSocketService {
  constructor() {
    this.socket = null;
    this.statusCallback = null;
    this.messageCallback = null;
  }

  setStatusCallback(callback) {
    this.statusCallback = callback;
  }

  setMessageCallback(callback) {
    this.messageCallback = callback;
  }

  connect() {
    this.socket = new WebSocket(backendUrl);
    //this.socket = new WebSocket("ws://192.168.2.128:1888/v2/tppa");
    //this.socket = new WebSocket("/v2/tppa");

    this.socket.onopen = () => {
      console.log("WebSocket verbunden.");
      if (this.statusCallback) {
        this.statusCallback("Verbunden");
      }
    };

    this.socket.onmessage = (event) => {
      console.log("Nachricht empfangen:", event.data);
      try {
        const message = JSON.parse(event.data);
        console.log("Geparste Nachricht:", message);
        if (this.messageCallback) {
          this.messageCallback(message);
        }
      } catch (error) {
        console.error("Fehler beim Parsen der Nachricht:", error);
        if (this.statusCallback) {
          this.statusCallback("Fehler beim Empfangen einer Nachricht");
        }
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket-Fehler:", error);
      if (this.statusCallback) {
        this.statusCallback("Fehler: " + error.message);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket geschlossen.");
      if (this.statusCallback) {
        this.statusCallback("Geschlossen");
      }
    };
  }

  // Aktualisierte Methode zum Senden von Nachrichten als einfache Strings
  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Nachricht direkt als String senden
      this.socket.send(message);
    } else {
      console.error("WebSocket ist nicht verbunden. Nachricht konnte nicht gesendet werden.");
      if (this.statusCallback) {
        this.statusCallback("Fehler: WebSocket nicht verbunden");
      }
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService;

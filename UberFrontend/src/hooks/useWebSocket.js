import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { SOCKET_URL } from "../services/api";

// SockJS is loaded as a global from CDN in index.html
// @stomp/stompjs accepts a webSocketFactory that returns a SockJS instance

export function useWebSocket({ onRideRequest, enabled = true }) {
  const clientRef = useRef(null);
  const onRideRequestRef = useRef(onRideRequest);
  onRideRequestRef.current = onRideRequest;

  useEffect(() => {
    if (!enabled) return;

    const client = new Client({
      // eslint-disable-next-line no-undef
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected to:", SOCKET_URL);
        client.subscribe("/topic/rideRequest", (message) => {
          try {
            const data = JSON.parse(message.body);
            onRideRequestRef.current?.(data);
          } catch (e) {
            console.error("Failed to parse ride request:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers?.message);
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled]);

  const sendRideResponse = (driverId, response) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/rideResponse/${driverId}`,
        body: JSON.stringify(response),
      });
    } else {
      console.warn("WebSocket not connected — cannot send ride response");
    }
  };

  return { sendRideResponse };
}

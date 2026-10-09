import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { SOCKET_URL } from "../services/api";

const BROADCAST_CHANNEL_NAME = "uber_ride_dispatch_channel";
const STORAGE_DISPATCH_KEY = "uber_last_accepted_ride";

export function useWebSocket({ driverId, onRideRequest, onRideAccepted, enabled = true }) {
  const clientRef = useRef(null);
  const onRideRequestRef = useRef(onRideRequest);
  onRideRequestRef.current = onRideRequest;

  const onRideAcceptedRef = useRef(onRideAccepted);
  onRideAcceptedRef.current = onRideAccepted;

  useEffect(() => {
    if (!enabled || !driverId) return;

    // 1. Cross-tab BroadcastChannel listener
    let broadcastChannel = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannel.onmessage = (event) => {
          const msg = event.data;
          if (msg?.type === "RIDE_ACCEPTED") {
            onRideAcceptedRef.current?.({
              bookingId: msg.bookingId,
              driverId: msg.driverId,
            });
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not supported:", e);
    }

    // 2. Storage event fallback for older browsers / cross-window sync
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_DISPATCH_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.bookingId) {
            onRideAcceptedRef.current?.({
              bookingId: parsed.bookingId,
              driverId: parsed.driverId,
            });
          }
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // 3. STOMP WebSocket client
    const client = new Client({
      // eslint-disable-next-line no-undef
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected to:", SOCKET_URL);

        // Driver-specific ride request queue
        client.subscribe(`/topic/rideRequest/${driverId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            onRideRequestRef.current?.(data);
          } catch (e) {
            console.error("Failed to parse ride request:", e);
          }
        });

        // Global ride acceptance channel (for when backend publishes to /topic/rideAccepted)
        client.subscribe("/topic/rideAccepted", (message) => {
          try {
            const data = JSON.parse(message.body);
            onRideAcceptedRef.current?.(data);
          } catch (e) {
            console.error("Failed to parse ride acceptance:", e);
          }
        });

        // Global ride request cancellation / taken channel
        client.subscribe("/topic/rideCancelled", (message) => {
          try {
            const data = JSON.parse(message.body);
            onRideAcceptedRef.current?.(data);
          } catch (e) {
            console.error("Failed to parse ride cancellation:", e);
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
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      window.removeEventListener("storage", handleStorageChange);
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled, driverId]);

  const sendRideResponse = (respDriverId, response) => {
    const isAccepted = response.response === "true" || response.response === true;

    // Notify all other driver tabs/windows immediately via BroadcastChannel & LocalStorage
    if (isAccepted && response.bookingId) {
      try {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          bc.postMessage({
            type: "RIDE_ACCEPTED",
            bookingId: response.bookingId,
            driverId: respDriverId,
          });
          bc.close();
        }
      } catch (e) {
        console.warn("Could not broadcast ride acceptance:", e);
      }

      try {
        localStorage.setItem(
          STORAGE_DISPATCH_KEY,
          JSON.stringify({
            bookingId: response.bookingId,
            driverId: respDriverId,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        // ignore
      }
    }

    // Publish to STOMP broker
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/rideResponse/${respDriverId}`,
        body: JSON.stringify(response),
      });
    } else {
      console.warn("WebSocket not connected — cannot send ride response");
    }
  };

  return { sendRideResponse };
}
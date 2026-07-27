import { useEffect, useRef } from 'react';
import { useDeviceStore } from '../store/deviceStore';

export const useWebSocket = (url = 'ws://localhost:8000/ws/telemetry') => {
  const ws = useRef(null);
  const { setWsStatus, updateDeviceTelemetry } = useDeviceStore();

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        setWsStatus(true);
      };

      ws.current.onclose = () => {
        console.log('WebSocket Disconnected, retrying...');
        setWsStatus(false);
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };

      ws.current.onerror = (err) => {
        console.error('WebSocket Error:', err);
        ws.current.close();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'telemetry') {
            updateDeviceTelemetry(data);
          }
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, setWsStatus, updateDeviceTelemetry]);
};

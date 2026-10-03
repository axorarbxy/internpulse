// INTERNAL MODULE 4 FUNCTIONALITY — provides a shared authenticated socket
import { createContext, useContext, useEffect, useState } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import { keysApi } from '../services/api';
import { ensureIdentityKey } from '../utils/crypto';

const SocketContext = createContext(null);

export function SocketProvider({ token, children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    const currentUser = JSON.parse(localStorage.getItem('internpulse_user') || '{}');
    if (currentUser.id) ensureIdentityKey(String(currentUser.id), keysApi.register).catch(() => {});
    const s = connectSocket(token);
    setSocket(s);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      disconnectSocket();
    };
  }, [token]);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}

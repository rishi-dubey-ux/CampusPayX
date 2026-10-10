import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const newSocket = io(`${SOCKET_URL}`);
    setSocket(newSocket);

    newSocket.on('queueUpdate', (updatedQueue) => {
      setQueue(updatedQueue);
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, queue }}>
      {children}
    </SocketContext.Provider>
  );
};

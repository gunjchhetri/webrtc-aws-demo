import { createContext, useState, useContext, useEffect } from "react";
import { SocketEventType } from "../utils/socketUtils";
type SocketContextParams = {
  error: string;
  sendMessage: (message: string) => void;
  availableUsers: Array<ConnectionDetails>;
  incomingCall: ConnectionDetails | null;
};
const SocketContext = createContext({} as SocketContextParams);

export type ConnectionDetails = {
  userName?: string;
  connectionId: string;
  channelName?: string;
};

const socket = new WebSocket(
  "wss://zlb3omiah5.execute-api.ap-south-1.amazonaws.com/prod"
);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: any) => {
  const [error, setError] = useState<string>("");
  const [incomingCall, setIncomingCall] = useState<ConnectionDetails | null>(
    null
  );
  const [availableUsers, setAvailableUsers] = useState<ConnectionDetails[]>([]);
  socket.onopen = (event: Event) => {
    console.log("connected", event);
  };
  socket.onclose = (event: Event) => {
    console.log("closed", event);
  };
  socket.onerror = (event: any) => {
    console.log("error", event);
    setError(event.data as any);
  };
  socket.onmessage = (event: any) => {
    console.log("message received", event);
    const { type, allConnections, newConnection, incomingCall } = JSON.parse(
      event.data
    );
    console.log("type", type);
    console.log("incomingCall", incomingCall);
    if (type == SocketEventType.AVAILABLE_CONNECTIONS) {
      setAvailableUsers(allConnections);
    }
    if (type == SocketEventType.NEW_CONNECTION) {
      setAvailableUsers((users) => [...users, newConnection]);
    }
    if (type == SocketEventType.INCOMING_CALL) {
      setIncomingCall(incomingCall);
    }
  };
  const sendMessage = (mesage: any) => {
    socket.send(mesage);
  };
  return (
    <SocketContext.Provider
      value={{ sendMessage, error, incomingCall, availableUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
};

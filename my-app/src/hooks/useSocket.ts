import { AvailableUsers } from "./../components/availableusers";
import { useState } from "react";
export type UserDetails = {
  userName: string;
  connectionId: string;
};
const socket = new WebSocket(
  "wss://zlb3omiah5.execute-api.ap-south-1.amazonaws.com/prod"
);
export enum ReceiveEventType {
  CALL_REQUEST = "CALL_REQUEST",
  NEW_CONNECTION = "NEW_CONNECTION",
  AVAILABLE_CONNECTIONS = "AVAILABLE_CONNECTIONS",
}
export enum SendEventType {
  REGISTER = "REGISTER",
}
export const useSocket = () => {
  const [error, setError] = useState<string>("");
  const [callRequests, setCallRequest] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserDetails[]>([]);

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
    const { type, allConnections, newConnection, requesterConnectionId } =
      JSON.parse(event.data);
    if (type == ReceiveEventType.AVAILABLE_CONNECTIONS) {
      setAvailableUsers(allConnections);
    }
    if (type == ReceiveEventType.NEW_CONNECTION) {
      setAvailableUsers((users) => [...users, newConnection]);
    }
    if (type == ReceiveEventType.CALL_REQUEST) {
      setCallRequest((req) => [...req, requesterConnectionId]);
    }
  };
  const sendMessage = (mesage: any) => {
    socket.send(mesage);
  };
  return { error, sendMessage, availableUsers, callRequests };
};

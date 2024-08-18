import { useSocket } from "../hooks/useSocket";
type UserProps = {
  onCall: Function;
  onReceive: Function;
  connectionId: string;
};
export const CallStatus = ({ onCall, onReceive, connectionId }: UserProps) => {
  const { callRequests } = useSocket();
  if (callRequests.includes(connectionId)) {
    return (
      <button onClick={() => onReceive(connectionId)}>Receive call</button>
    );
  } else {
    return <button onClick={() => onCall(connectionId)}>Make a call</button>;
  }
};

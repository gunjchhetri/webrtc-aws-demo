import { useSocket } from "../contexts/socketContext";
type IncominCallProps = {
  joinCall: (chanelName: string) => void;
};
export const IncomingCall = ({ joinCall }: IncominCallProps) => {
  const { incomingCall } = useSocket();
  if (incomingCall) {
    return (
      <div>
        <div>Incoming call from {incomingCall.userName}</div>
        <button onClick={() => joinCall(incomingCall.channelName!)}>
          Receive
        </button>
      </div>
    );
  } else {
    return <></>;
  }
};

import { useSocket } from "../hooks/useSocket";
import { CallStatus } from "./callstatus";
type UserProps = {
  onCall: Function;
  onReceive: Function;
};
export const AvailableUsers = ({ onCall, onReceive }: UserProps) => {
  const { availableUsers } = useSocket();
  console.log("availableUsers", availableUsers);
  return availableUsers.length ? (
    <>
      {availableUsers.map((obj) => (
        <div>
          <strong>{obj.userName}</strong>
          <CallStatus
            onCall={onCall}
            onReceive={onReceive}
            connectionId={obj.connectionId}
          ></CallStatus>
        </div>
      ))}
    </>
  ) : (
    <div>No Users Available</div>
  );
};

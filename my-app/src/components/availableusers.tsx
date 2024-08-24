import { useSocket } from "../contexts/socketContext";
type AvailableProps = {
  makeCall: (conectionId: string) => void;
};
export const AvailableUsers = ({ makeCall }: AvailableProps) => {
  const { availableUsers } = useSocket();

  console.log("availableUsers", availableUsers);
  return availableUsers.length ? (
    <>
      {availableUsers.map((obj) => (
        <div>
          <strong>{obj.userName}</strong>
          <button onClick={() => makeCall(obj.connectionId)}>
            Make a call
          </button>
        </div>
      ))}
    </>
  ) : (
    <div>No Users Available</div>
  );
};

import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/socketContext";
import { getPayload, SocketEventType } from "../utils/socketUtils";
export const Default = () => {
  const navigate = useNavigate();
  const { sendMessage } = useSocket();
  const inputRef = useRef<any>();
  const regsiterUser = (userName: string) => {
    sendMessage(getPayload({ userName }, SocketEventType.REGISTER));

    navigate("/chat");
  };
  return (
    <div>
      <input type="text" ref={inputRef}></input>
      <button onClick={() => regsiterUser(inputRef.current.value)}>
        Register
      </button>
    </div>
  );
};

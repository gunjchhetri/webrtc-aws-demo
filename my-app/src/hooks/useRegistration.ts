import { useState } from "react";
import { SendEventType, useSocket } from "./useSocket";

export const useRegistration = () => {
  const [userName, setUserName] = useState("");
  const { sendMessage } = useSocket();
  const regsiterUser = (userName: string) => {
    sendMessage(JSON.stringify({ type: SendEventType.REGISTER, userName }));
    setUserName(userName);
  };
  return { userName, regsiterUser };
};

import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Role } from "amazon-kinesis-video-streams-webrtc";
import { Master } from "./components/master";
import { Viewer } from "./components/viewer";
import { AvailableUsers } from "./components/availableusers";
import { useRole } from "./hooks/useRole";
import { useRegistration } from "./hooks/useRegistration";
const viewByRole = {
  MASTER: <Master></Master>,
  VIEWER: <Viewer></Viewer>,
  DEFAULT: <></>,
};

function App() {
  const { role } = useRole();
  const inputRef = useRef<any>();
  const { regsiterUser, userName } = useRegistration();
  const onCall = () => {};
  const onReceive = () => {};

  return (
    <div className="App">
      {userName ? (
        <AvailableUsers onCall={onCall} onReceive={onReceive}></AvailableUsers>
      ) : (
        <></>
      )}
      <div>
        <input type="text" ref={inputRef}></input>
        <button onClick={() => regsiterUser(inputRef.current.value)}>
          Register
        </button>
      </div>
      <div>{viewByRole[role]}</div>
    </div>
  );
}

export default App;

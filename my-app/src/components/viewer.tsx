import { Role } from "amazon-kinesis-video-streams-webrtc";
import useWebRTC from "../hooks/useWebRTC";
import useViewer from "../hooks/useViewer";
import { useEffect, useRef } from "react";

export const Viewer = () => {
  const ref = useRef<any>();
  const remoteRef = useRef<any>();
  const { returnStream, remoteStream } = useViewer(
    Role.VIEWER,
    undefined,
    (data: any) => {
      console.log(data);
    }
  );
  useEffect(() => {
    remoteRef.current.srcObject = remoteStream;
    console.log("remote added stream", remoteStream);
  }, [remoteStream]);
  useEffect(() => {
    ref.current.srcObject = returnStream;
    console.log("added stream", returnStream);
  }, [returnStream]);
  console.log("CLient Page Opened");
  return (
    <div>
      Master Page
      <video
        ref={ref}
        autoPlay
        playsInline
        controls
        style={{ width: "100%" }}
      ></video>
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        controls
        style={{ width: "100%" }}
      ></video>
    </div>
  );
};

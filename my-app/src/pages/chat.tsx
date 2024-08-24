import { Role } from "amazon-kinesis-video-streams-webrtc";
import { AvailableUsers } from "../components/availableusers";
import useMasterWebRTC from "../hooks/useMaster";
import { useViewerWebRTC } from "../hooks/useViewer";
import { useRef, useState } from "react";
import { useSocket } from "../contexts/socketContext";
import { getPayload, SocketEventType } from "../utils/socketUtils";
import { IncomingCall } from "../components/incomingCall";
import { StreamViewer } from "../components/streamViewer";

const credentials = {
  accessKeyId: "AKIATCKAO7MXAVNMYKY3",
  secretAccessKey: "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",
};
export const Chat = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<any>();
  const { sendMessage } = useSocket();
  const { initializeMaster } = useMasterWebRTC(Role.MASTER, credentials);

  const onRemoteStream = (stream: MediaStream) => {
    setRemoteStream(stream);
  };
  const { initializeViewer } = useViewerWebRTC(Role.VIEWER, credentials);
  const openLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return stream;
  };
  const makeCall = async (connectionId: string) => {
    const channelName = `chanel-${new Date().getTime()}`;
    const stream = await openLocalStream();
    await initializeMaster(stream, channelName, onRemoteStream);
    sendMessage(
      getPayload(
        { receiverConnectioId: connectionId, channelName },
        SocketEventType.INCOMING_CALL
      )
    );
    setLocalStream(stream);
  };
  const onJoinCall = async (channelName: string) => {
    const stream = await openLocalStream();
    await initializeViewer(stream, channelName, onRemoteStream);
    setLocalStream(stream);
  };
  return (
    <>
      <AvailableUsers makeCall={makeCall}></AvailableUsers>
      <IncomingCall joinCall={onJoinCall}></IncomingCall>
      <StreamViewer stream={localStream}></StreamViewer>
      <StreamViewer stream={remoteStream}></StreamViewer>

      {/* <div>
        <video
          ref={localStreamRef}
          autoPlay
          playsInline
          controls
          style={{ width: "100%" }}
        ></video>
        <video
          ref={remoteStreamRef}
          autoPlay
          playsInline
          controls
          style={{ width: "100%" }}
        ></video>
      </div> */}
    </>
  );
};

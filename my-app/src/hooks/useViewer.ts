import { useState } from "react";

import { Role } from "amazon-kinesis-video-streams-webrtc";
import { initializeWebRTC } from "../services/webrtcService";

const region = "ap-south-1";
export const useViewerWebRTC = (
  role: Role,
  credentials: { accessKeyId: string; secretAccessKey: string }
) => {
  const initializeViewer = async (
    stream: MediaStream,
    channelName: string,
    onRemoteStream: (stream: MediaStream) => void
  ) => {
    console.log("channneName", channelName);
    const { signalingClient, iceServers } = await initializeWebRTC(
      channelName,
      region,
      role,
      credentials,
      true
    );
    // Create WebRTC Peer Connection
    const peerConnection = new RTCPeerConnection({ iceServers });

    stream.getTracks().forEach((track) => {
      console.log("track", track);
      peerConnection.addTrack(track, stream);
    });
    peerConnection.onicecandidate = ({ candidate }) => {
      console.log("Received peer onicecandidate", candidate);
      if (candidate) signalingClient.sendIceCandidate(candidate);
    };

    peerConnection.ontrack = (event) => {
      console.log("Received peer track", event);
      onRemoteStream(event.streams[0]);
    };

    // Handle signaling open event and wait for SDP offer
    signalingClient.on("open", async () => {
      console.log("Signaling client opened");
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peerConnection.setLocalDescription(offer);
      signalingClient.sendSdpOffer(peerConnection.localDescription!);
      console.log("SDP offer sent");
    });

    signalingClient.on("sdpOffer", async (offer) => {
      console.log("Received SDP offer");
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      // Create SDP answer
      const answer = await peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peerConnection.setLocalDescription(answer);
      signalingClient.sendSdpAnswer(peerConnection.localDescription!);
      console.log("SDP answer sent");
    });
    signalingClient.on("sdpAnswer", async (answer) => {
      console.log("Received SDP answer", answer);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });
    signalingClient.on("iceCandidate", async (candidate) => {
      console.log("Received ICE candidate");
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    signalingClient.open();
  };
  return { initializeViewer };
};

export default useViewerWebRTC;

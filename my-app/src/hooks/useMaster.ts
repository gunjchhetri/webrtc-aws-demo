import { useState } from "react";

import { Role } from "amazon-kinesis-video-streams-webrtc";
import { initializeWebRTC } from "../services/webrtcService";

const region = "ap-south-1";

export const useMasterWebRTC = (
  role: Role,
  credentials: { accessKeyId: string; secretAccessKey: string }
) => {
  const initializeMaster = async (
    stream: MediaStream,
    channelName: string,
    onRemoteStream: (stream: MediaStream) => void
  ) => {
    console.log("channneName", channelName);
    const { signalingClient, iceServers } = await initializeWebRTC(
      channelName,
      region,
      role,
      credentials
    );
    const peerConnection = new RTCPeerConnection({ iceServers });

    peerConnection.ontrack = (event) => {
      console.log("Received peer track", event);
      onRemoteStream(event.streams[0]);
    };
    peerConnection.onicecandidate = ({ candidate }) => {
      console.log("Received peer onicecandidate");
      if (candidate) {
        signalingClient.sendIceCandidate(candidate);
      } else {
        signalingClient.sendSdpOffer(peerConnection.localDescription!);
      }
    };

    stream.getTracks().forEach((track) => {
      console.log("track", track);
      peerConnection.addTrack(track, stream);
    });
    signalingClient.on("open", async () => {
      console.log("Signaling client opened");
    });
    signalingClient.on("sdpOffer", async (offer, remoteClientId) => {
      console.log("Received offer", remoteClientId);
      console.log("Received offer", offer);
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peerConnection.setLocalDescription(answer);
      signalingClient.sendSdpAnswer(
        peerConnection.localDescription!,
        remoteClientId
      );

      // Create an SDP answer to send back to the client
      console.log("[MASTER] Creating SDP answer for client: " + remoteClientId);
    });
    signalingClient.on("sdpAnswer", async (answer) => {
      console.log("Received SDP answer");
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

  return { initializeMaster };
};

export default useMasterWebRTC;

import { useEffect, useState } from "react";
import {
  KinesisVideoClient,
  GetSignalingChannelEndpointCommand,
  CreateSignalingChannelCommand,
  ResourceEndpointListItem,
  DescribeSignalingChannelCommand,
} from "@aws-sdk/client-kinesis-video";
import * as AWS from "@aws-sdk/client-kinesis-video-signaling";

import { Role, SignalingClient } from "amazon-kinesis-video-streams-webrtc";

const region = "ap-south-1";
const service = "kinesisvideo";
const url =
  "https://kinesisvideo.ap-south-1.amazonaws.com/v1/get-ice-server-config";
const channelName = `Channel123`;
export const useWebRTC = (
  role: Role,
  channelArn: string | undefined,
  onStream: any
) => {
  const [dataChannel, setDataChannel] = useState<any>(null);
  const [returnStream, setStrem] = useState<any>();
  const [remoteStream, setRemoteStrem] = useState<any>();
  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        const kinesisVideoClient = new KinesisVideoClient({
          region,
          credentials: {
            accessKeyId: " ",
            secretAccessKey: " ",
          },
        });

        if (!channelArn) {
          const describeChannelCommand = new DescribeSignalingChannelCommand({
            ChannelName: channelName,
          });
          try {
            const describeChannelResponse = await kinesisVideoClient.send(
              describeChannelCommand
            );
            channelArn = describeChannelResponse.ChannelInfo?.ChannelARN;
          } catch (err) {
            console.log(err);
          }

          if (!channelArn) {
            const createChannelCommand = new CreateSignalingChannelCommand({
              ChannelName: channelName,
            });

            const createChannelResponse = await kinesisVideoClient.send(
              createChannelCommand
            );
            channelArn = createChannelResponse.ChannelARN;
          }
        }

        // Get Signaling Channel Endpoints
        const endpointsResponse = await kinesisVideoClient.send(
          new GetSignalingChannelEndpointCommand({
            ChannelARN: channelArn,
            SingleMasterChannelEndpointConfiguration: {
              Protocols: ["WSS", "HTTPS"],
              Role: role,
            },
          })
        );
        const endpoints = endpointsResponse!.ResourceEndpointList!.reduce(
          (acc: any, endpoint: ResourceEndpointListItem) => {
            acc[endpoint.Protocol!] = endpoint.ResourceEndpoint;
            return acc;
          },
          {}
        );

        const signaingICEclient = new AWS.KinesisVideoSignaling({
          region,
          credentials: {
            accessKeyId: " ", // Your AWS Access Key ID
            secretAccessKey: " ", // Your AWS Secret Access Key
          },
          endpoint: endpoints["HTTPS"],
        });
        let iceServers = [] as any;
        const iceServerResponse = await signaingICEclient.getIceServerConfig({
          ChannelARN: channelArn,
        });
        try {
          iceServers = iceServerResponse!.IceServerList!.map(
            (server) =>
              ({
                urls: server.Uris,
                username: server.Username,
                credential: server.Password,
              } as RTCIceServer)
          );
          iceServers.push({
            urls: [`stun:stun.kinesisvideo.ap-south-1.amazonaws.com:443`],
          });
        } catch (err) {
          console.log(err);
        }
        const signalingClient = new SignalingClient({
          channelARN: channelArn!,
          role: role,
          clientId: new Date().getTime().toString(),
          region,
          channelEndpoint: endpoints["WSS"],
          systemClockOffset: kinesisVideoClient.config.systemClockOffset,
          credentials: {
            accessKeyId: " ",
            secretAccessKey: " ",
          },
        });

        // Create WebRTC Peer Connection
        const peerConnection = new RTCPeerConnection({ iceServers });
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStrem(stream);
        stream.getTracks().forEach((track) => {
          console.log("track", track);
          peerConnection.addTrack(track, stream);
        });
        peerConnection.onicecandidate = ({ candidate }) => {
          console.log("Received peer onicecandidate", candidate);
          if (candidate) signalingClient.sendIceCandidate(candidate);
        };
        //setPeerConnection(pc);
        peerConnection.ontrack = (event) => {
          console.log("Received peer track", event);
          setRemoteStrem(event.streams[0]);
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
      } catch (err) {
        console.log("error found", err);
      }
    };

    initializeWebRTC();
  }, []);

  return { returnStream, remoteStream };
};

export default useWebRTC;

import { useEffect, useState } from "react";
import {
  KinesisVideoClient,
  GetSignalingChannelEndpointCommand,
  CreateSignalingChannelCommand,
  ResourceEndpointListItem,
  DescribeSignalingChannelCommand,
} from "@aws-sdk/client-kinesis-video";
import * as AWS from "@aws-sdk/client-kinesis-video-signaling";

import {
  KinesisVideoSignalingClient,
  GetIceServerConfigCommand,
} from "@aws-sdk/client-kinesis-video-signaling";
import { Role, SignalingClient } from "amazon-kinesis-video-streams-webrtc";
import { GetSessionTokenCommand, STSClient } from "@aws-sdk/client-sts";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-browser";
import { HttpRequest } from "@aws-sdk/protocol-http";
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
            secretAccessKey: "", // Your AWS Secret Access Key
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
            urls: `stun:stun.kinesisvideo.ap-south-1.amazonaws.com:443`,
          });
        } catch (err) {
          console.log(err);
        }
        const signalingClient = new SignalingClient({
          channelARN: channelArn!,
          role: role,
          clientId: role == Role.VIEWER ? "123445" : "",
          region,
          channelEndpoint: endpoints["WSS"],
          systemClockOffset: kinesisVideoClient.config.systemClockOffset,
          credentials: {
            accessKeyId: " ",
            secretAccessKey: "",
          },
        });

        // Create WebRTC Peer Connection
        const pc = new RTCPeerConnection({ iceServers });
        //setPeerConnection(pc);
        pc.ontrack = (event) => {
          if (onStream) {
            onStream(event.streams[0]);
          }
        };

        if (role === "MASTER") {
          // Add local media tracks
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));

          // Create an offer
          // const offer = await pc.createOffer();
          // await pc.setLocalDescription(offer);
          // signalingClient.sendSdpOffer(
          //   pc.localDescription as RTCSessionDescription
          // );
        }

        signalingClient.on("open", async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          signalingClient.sendSdpOffer(
            pc.localDescription as RTCSessionDescription
          );
        });

        signalingClient.on("sdpAnswer", async (answer) => {
          await pc.setRemoteDescription(answer);
        });

        signalingClient.on("iceCandidate", (candidate) => {
          pc.addIceCandidate(candidate);
        });

        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            signalingClient.sendIceCandidate(candidate);
          }
        };

        signalingClient.open();
      } catch (err) {
        console.log("error found", err);
      }
    };

    initializeWebRTC();

    // return () => {
    //   if (peerConnection) {
    //     peerConnection.close();
    //   }
    // };
  }, []);

  return { dataChannel };
};

export default useWebRTC;

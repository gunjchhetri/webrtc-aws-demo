import {
  CreateSignalingChannelCommand,
  DescribeSignalingChannelCommand,
  GetSignalingChannelEndpointCommand,
  KinesisVideoClient,
  ResourceEndpointListItem,
} from "@aws-sdk/client-kinesis-video";
import { KinesisVideoSignaling } from "@aws-sdk/client-kinesis-video-signaling";
import { Role, SignalingClient } from "amazon-kinesis-video-streams-webrtc";

export const initializeWebRTC = async (
  channelName: string,
  region: string,
  role: Role,
  credentials: { accessKeyId: string; secretAccessKey: string },
  isViewer = false
) => {
  const kinesisVideoClient = new KinesisVideoClient({
    region,
    credentials,
  });
  let channelArn;
  if (isViewer) {
    channelArn = await describeChannel(kinesisVideoClient, channelName);
  } else {
    channelArn = await createChannel(kinesisVideoClient, channelName);
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

  const kvICEclient = new KinesisVideoSignaling({
    region,
    credentials,
    endpoint: endpoints["HTTPS"],
  });
  let iceServers = [] as any;
  const iceServerResponse = await kvICEclient.getIceServerConfig({
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
  let signalingClient;
  if (isViewer) {
    signalingClient = new SignalingClient({
      channelARN: channelArn!,
      role: role,
      clientId: "iden123",
      region,
      channelEndpoint: endpoints["WSS"],
      systemClockOffset: kinesisVideoClient.config.systemClockOffset,
      credentials,
    });
  } else {
    signalingClient = new SignalingClient({
      channelARN: channelArn!,
      role: role,
      region,
      channelEndpoint: endpoints["WSS"],
      systemClockOffset: kinesisVideoClient.config.systemClockOffset,
      credentials,
    });
  }
  return { signalingClient, iceServers };
};
const createChannel = async (
  kinesisVideoClient: KinesisVideoClient,
  channelName: string
) => {
  const createChannelCommand = new CreateSignalingChannelCommand({
    ChannelName: channelName,
  });

  const createChannelResponse = await kinesisVideoClient.send(
    createChannelCommand
  );
  return createChannelResponse.ChannelARN;
};
const describeChannel = async (
  kinesisVideoClient: KinesisVideoClient,
  channelName: string
) => {
  const describeChannelCommand = new DescribeSignalingChannelCommand({
    ChannelName: channelName,
  });

  const describeChannelResponse = await kinesisVideoClient.send(
    describeChannelCommand
  );
  return describeChannelResponse.ChannelInfo?.ChannelARN;
};

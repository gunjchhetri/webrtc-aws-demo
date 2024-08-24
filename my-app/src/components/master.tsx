import { Role } from "amazon-kinesis-video-streams-webrtc";
import useWebRTC from "../hooks/useWebRTC";
import useMaster from "../hooks/useMaster";
import { useEffect, useRef } from "react";
export {};
// export const Master = () => {
//   const ref = useRef<any>();
//   const remoteRef = useRef<any>();
//   const { returnStream, remoteStream } = useMaster(
//     Role.MASTER,
//     "ref",
//     {} as any
//   );
//   useEffect(() => {
//     remoteRef.current.srcObject = remoteStream;
//     console.log("added stream", remoteStream);
//   }, [remoteStream]);
//   useEffect(() => {
//     ref.current.srcObject = returnStream;
//     console.log("added stream");
//   }, [returnStream]);
//   console.log("returnStream", returnStream);
//   console.log("Master Page Opened");
//   return (
//     <div>
//       Master Page
//       <video
//         ref={ref}
//         autoPlay
//         playsInline
//         controls
//         style={{ width: "100%" }}
//       ></video>
//       <video
//         ref={remoteRef}
//         autoPlay
//         playsInline
//         controls
//         style={{ width: "100%" }}
//       ></video>
//     </div>
//   );
// };

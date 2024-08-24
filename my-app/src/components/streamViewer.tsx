import { useEffect, useRef } from "react";

export const StreamViewer = ({ stream }: { stream: null | MediaStream }) => {
  const streamRef = useRef<any>();
  useEffect(() => {
    if (streamRef?.current) {
      streamRef.current.srcObject = stream;
    }
  });
  return stream ? (
    <div>
      <video
        ref={streamRef}
        autoPlay
        playsInline
        controls
        style={{ width: "100%" }}
      ></video>
    </div>
  ) : (
    <></>
  );
};

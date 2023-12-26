// // frontend code App.js
// import React, { useEffect, useRef, useState, useCallback } from "react";
// import io from "socket.io-client";

// const SOCKET_SERVER_URL = "https://r5kxnp-8000.csb.app";

// const OFFER_OPTIONS = {
//   offerToReceiveAudio: 1,
//   offerToReceiveVideo: 1,
// };
// const VIDEO_CONSTRAINTS = { audio: true, video: true };

// const App = () => {
//   const socket = useRef(null);
//   const inputRef = useRef(null);
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerConnectionRef = useRef(null);
//   const connectedWithRef = useRef({});
//   const [btnDisabled, setBtnDisabled] = useState(false);

//   const [msgGot, setMsgGot] = useState("");

//   const emitEventToServer = useCallback((eventName, data) => {
//     socket.current.emit(eventName, data);
//   }, []);

// const processSdp = useCallback(
//   async (offer) => {
//     try {
//       await peerConnectionRef.current?.setLocalDescription(
//         new RTCSessionDescription(offer),
//       );
//       const payload = {
//         fromSocket: socket.id,
//         toSocket: connectedWithRef.current?.socketId,
//         data: offer,
//       };
//       emitEventToServer("sdp", payload);
//     } catch (error) {
//       console.error("Error processing SDP:", error);
//     }
//   },
//   [emitEventToServer],
// );

//   const processSdp = async (offer) => {
//     try {
//       // if (peerConnectionRef.current.signalingState !== "stable") {
//       await peerConnectionRef.current?.setLocalDescription(
//         new RTCSessionDescription(offer),
//       );
//       // }
//       const payload = {
//         fromSocket: socket.id,
//         toSocket: connectedWithRef.current?.socketId,
//         data: offer,
//       };
//       emitEventToServer("sdp", payload);
//     } catch (error) {
//       console.error("Error processing SDP:", error);
//     }
//   };

// const createOffer = async () => {
//   try {
//     const offer = await peerConnectionRef.current.createOffer(OFFER_OPTIONS);
//     processSdp(offer);
//   } catch (error) {
//     console.error("Error creating offer:", error);
//   }
// };

//   const createAnswer = async () => {
//     try {
//       if (peerConnectionRef.current.signalingState === "have-remote-offer") {
//         const answer = await peerConnectionRef.current.createAnswer();
//         processSdp(answer);
//       }
//     } catch (error) {
//       console.error("Error creating answer:", error);
//     }
//   };

//   const handleIceCandidate = (event) => {
//     if (event.candidate) {
//       emitEventToServer("candidate", {
//         data: event.candidate,
//         fromSocket: socket.id,
//         toSocket: connectedWithRef.current?.socketId,
//       });
//     }
//   };

//   const handleTrack = (event) => {
//     remoteVideoRef.current.srcObject = event.streams[0];
//   };

//   const initializePeerConnection = () => {
//     peerConnectionRef.current?.close(); // close peerconnection if already exist
//     peerConnectionRef.current = new RTCPeerConnection(null);

//     if (peerConnectionRef.current) {
//       peerConnectionRef.current.onicecandidate = handleIceCandidate;
//       peerConnectionRef.current.ontrack = handleTrack;

//       peerConnectionRef.current.onnegotiationneeded = () => {
//         if (peerConnectionRef.current.signalingState === "stable") {
//           createOffer();
//         }
//       };
//     }

//     navigator.mediaDevices
//       ?.getUserMedia(VIDEO_CONSTRAINTS)
//       .then((stream) => {
//         localVideoRef.current.srcObject = stream;
//         stream.getTracks().forEach((elem) => {
//           peerConnectionRef.current?.addTrack(elem, stream);
//         });
//       })
//       .catch((error) => {
//         console.error("Error accessing media devices:", error);
//       });
//   };

//   useEffect(() => {
//     socket.current = io.connect(SOCKET_SERVER_URL);

//     socket.current.on(
//       "connectedWithSomeOne",
//       ({ shouldCreateOffer, connectedWith }) => {
//         connectedWithRef.current = connectedWith;
//         setBtnDisabled(true);

//         if (shouldCreateOffer) {
//           createOffer();
//         }

//         socket.current.on("sdp", async ({ data }) => {
//           console.log(`got sdp ${data.type}`, peerConnectionRef.current);
//           if (
//             peerConnectionRef.current.signalingState === "stable" ||
//             peerConnectionRef.current.signalingState !== "have-local-offer'"
//           ) {
//             await peerConnectionRef.current?.setRemoteDescription(
//               new RTCSessionDescription(data),
//             );
//           }
//           if (peerConnectionRef.current) {
//             createAnswer();
//           }
//         });

//         socket.current.on("candidate", (candidate) => {
//           peerConnectionRef.current?.addIceCandidate(candidate);
//         });
//       },
//     );

//     socket.current.on("gotMessage", (msg) => {
//       setMsgGot(msg);
//     });

//     socket.current.on("userDisconnected", () => {
//       peerConnectionRef.current = null;
//       if (remoteVideoRef.current.srcObject) {
//         remoteVideoRef.current.srcObject = null;
//       }
//       initializePeerConnection();
//     });

//     initializePeerConnection();

//     return () => {
//       socket.current?.disconnect();
//     };
//   }, []);

//   const sendMessage = () => {
//     const msg = inputRef.current.value;
//     emitEventToServer("sendMessage", { from: socket.id, msg });
//   };

//   const connectWithSomeOne = () => {
//     // if (peerConnectionRef.current?.signalingState === "stable") {
//     //   console.log("stable called");
//     //   initializePeerConnection();
//     //   emitEventToServer("connectWithSomeone", socket.current?.id);
//     // } else {
//     //   emitEventToServer("connectWithSomeone", socket.current?.id);
//     // }
//     emitEventToServer("connectWithSomeone", socket.current?.id);
//   };

//   return (
//     <div>
//       <div style={{ display: "flex", gap: "10px" }}>
//         <video
//           style={{ backgroundColor: "black", width: "300px", height: "300px" }}
//           ref={localVideoRef}
//           autoPlay
//         />
//         <video
//           style={{ backgroundColor: "black", width: "300px", height: "300px" }}
//           ref={remoteVideoRef}
//           autoPlay
//         />
//       </div>

//       <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
//         <textarea
//           type="text"
//           placeholder="write something..."
//           ref={inputRef}
//           style={{
//             width: "250px",
//             height: "150px",
//             padding: "20px",
//             backgroundColor: "lightgray",
//             color: "black",
//           }}
//         />
//         <textarea
//           placeholder="you will receive messages here..."
//           // value={msgGot.join(" ")}
//           value={msgGot}
//           readOnly
//           style={{
//             width: "250px",
//             height: "150px",
//             padding: "20px",
//             backgroundColor: "lightgray",
//             color: "black",
//           }}
//         />
//       </div>

//       <button onClick={sendMessage}>send message</button>
//       <div>
//         <button onClick={() => connectWithSomeOne()}>
//           connect with someone
//         </button>
//       </div>
//     </div>
//   );
// };

// export default App;

//------------------------------------------------------------------------------------------------------------------------

import { useRef, useState } from "react";
import io from "socket.io-client";
// const SOCKET_SERVER_URL = "https://r5kxnp-8000.csb.app";

const SOCKET_SERVER_URL = "https://rtc-testing.onrender.com";


const OFFER_OPTIONS = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

function App() {
  const socket = useRef(null);
  const [peerConnection, setPeerconnection] = useState(null);
  console.log("peer connection", peerConnection);
  const [connectedWithState, setConnectedWithState] = useState(null);
  console.log("connect with state", connectedWithState);
  // const connectedWithRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  const emitEventToServer = (eventName, data) => {
    socket.current.emit(eventName, data);
  };

  //initializeConnection --------------------
  const initializeConnection = async () => {
    let pc = new RTCPeerConnection(null);
    let tempConnectedWith = null;
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emitEventToServer("candidate", {
          data: event.candidate,
          fromSocket: socket.id,
          toSocket: tempConnectedWith?.socketId,
        });
      }
    };

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    const processSdp = async (offer) => {
      try {
        await pc?.setLocalDescription(new RTCSessionDescription(offer));
        const payload = {
          fromSocket: socket.id,
          toSocket: tempConnectedWith?.socketId,
          data: offer,
        };
        emitEventToServer("sdp", payload);
      } catch (error) {
        console.error("Error processing SDP:", error);
      }
    };

    const createOffer = async () => {
      try {
        const offer = await pc.createOffer(OFFER_OPTIONS);
        processSdp(offer);
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    };

    const createAnswer = async () => {
      try {
        if (pc.signalingState === "have-remote-offer") {
          const answer = await pc.createAnswer();
          processSdp(answer);
        }
      } catch (error) {
        console.error("Error creating answer:", error);
      }
    };

    try {
      const stream = await navigator.mediaDevices?.getUserMedia({
        audio: true,
        video: true,
      });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((elem) => {
        pc?.addTrack(elem, stream);
      });
    } catch (error) {
      console.log("erro accessing media devices", error);
    }

    //------------------------- socket.io initializeConnection
    socket.current = io.connect(SOCKET_SERVER_URL);

    socket.current.on(
      "connectedWithSomeOne",
      ({ shouldCreateOffer, connectedWith }) => {
        tempConnectedWith = connectedWith;

        socket.current.on("sdp", async ({ data }) => {
          console.log(" received sdp", data);
          try {
            await pc?.setRemoteDescription(new RTCSessionDescription(data));
            if (pc.signalingState == "have-remote-offer") {
              createAnswer();
            }
          } catch (error) {
            console.log("error when got sdp", error);
          }
        });

        socket.current.on("candidate", (candidate) => {
          pc?.addIceCandidate(candidate);
        });
        console.log("connected with some called event front");
        setConnectedWithState(tempConnectedWith);
        if (shouldCreateOffer) {
          createOffer();
        }
      },
    );

    socket.current.on("userDisconnected", () => {
      setPeerconnection(null);
      if (remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = null;
      }
      setPeerconnection(null);
      setConnectedWithState(null);
      initializeConnection();
    });
    setPeerconnection(pc);
    return () => {
      socket.current?.disconnect();
    };
  };

  const connectWithSomeOne = () => {
    emitEventToServer("connectWithSomeone", socket.current?.id);
  };

  return (
    <div>
      <div style={{ gap: "20px", display: "flex" }}>
        <video
          style={{ width: "300px", height: "200px", background: "black" }}
          ref={localVideoRef}
          autoPlay
        />
        <video
          style={{ width: "300px", height: "200px", background: "black" }}
          ref={remoteVideoRef}
          autoPlay
        />
      </div>
      <br />
      <button onClick={() => initializeConnection()}>on camera</button>
      <button onClick={() => connectWithSomeOne()}>connect</button>
    </div>
  );
}

export default App;

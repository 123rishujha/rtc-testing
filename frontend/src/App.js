// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";

// const App = () => {
//   const socket = useRef(null);
//   const inputRef = useRef(null);
//   const [msgGot, setMsgGot] = useState("");
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef();
//   const peerConnectionRef = useRef();
//   // const localStreamState = useRef(null);
//   // const remoteStreamRef = useRef(null);

//   const connectedWithRef = useRef({});

//   const offerOptions = {
//     offerToReceiveAudio: 1,
//     offerToReceiveVideo: 1,
//   };

//   const connectWithSomeOne = () => {
//     socket.current.emit("connectWithSomeone", socket.current?.id);
//   };

//   const emitEventsToServer = (eventName, { fromSocket, toSocket, data }) => {
//     socket.current.emit(eventName, { fromSocket, toSocket, data });
//   };

//   const processSdp = async (offer) => {
//     try {
//       await peerConnectionRef.current?.setLocalDescription(
//         new RTCSessionDescription(offer)
//       );
//       const payload = {
//         // fromSocket: socket.current.id,
//         fromSocket: socket.id,
//         toSocket: connectedWithRef.current?.socketId,
//         data: offer,
//       };
//       emitEventsToServer("sdp", payload);
//     } catch (error) {
//       console.log("error", error);
//     }
//   };

//   const sendMessage = () => {
//     const msg = inputRef.current.value;
//     socket.current.emit("sendMessage", { from: socket.id, msg });
//   };

//   const createOffer = async () => {
//     try {
//       const offer = await peerConnectionRef.current.createOffer(offerOptions);
//       processSdp(offer);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const createAnswer = async () => {
//     console.log("peerconnection", peerConnectionRef.current);
//     try {
//       const answer = await peerConnectionRef.current.createAnswer();
//       processSdp(answer);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     socket.current = io.connect("http://localhost:8000");

//     // socket connection success;
//     socket.current?.on(
//       "connectedWithSomeOne",
//       ({ shouldCreateOffer, connectedWith }) => {
//         console.log("connectedWith", connectedWith);
//         connectedWithRef.current = connectedWith;

//         socket.current?.on("sdp", async ({ data, fromSocket }) => {
//           console.log("got offer", JSON.stringify(data));
//           await peerConnectionRef.current?.setRemoteDescription(
//             new RTCSessionDescription(data)
//           );
//           //create answer
//           if (peerConnectionRef.current) {
//             createAnswer();
//           }
//         });

//         socket.current?.on("candidate", (candidate) => {
//           console.log("got candidate", JSON.stringify(candidate));
//           peerConnectionRef.current?.addIceCandidate(candidate);
//         });
//         // create offer
//         if (shouldCreateOffer) {
//           createOffer();
//         }
//       }
//     );

//     // got message
//     socket.current.on("gotMessage", (msg) => {
//       // setMsgGot((prev) => [...prev, msg]);
//       setMsgGot(msg);
//     });

//     // settting up peer connection
//     peerConnectionRef.current = new RTCPeerConnection(null);

//     if (peerConnectionRef.current) {
//       peerConnectionRef.current.onicecandidate = (event) => {
//         if (event.candidate) {
//           emitEventsToServer("candidate", {
//             data: event.candidate,
//             fromSocket: socket.id,
//             toSocket: connectedWithRef.current?.socketId,
//           });
//         }
//       };
//       peerConnectionRef.current.ontrack = (event) => {
//         console.log("909 ------------------- on track called");
//         remoteVideoRef.current.srcObject = event.streams[0];
//       };
//       //adding local streams to peer connection object
//     }

//     // get user media------------------------------------------------
//     navigator.mediaDevices
//       ?.getUserMedia({ audio: true, video: true })
//       .then((stream) => {
//         localVideoRef.current.srcObject = stream;
//         stream.getTracks().forEach((elem) => {
//           peerConnectionRef.current?.addTrack(elem, stream);
//         });
//       })
//       .catch((error) => {
//         console.log("error", error);
//       });

//     return () => socket.current?.disconnect();
//   }, []);

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

//-------------------------------optimised code--------------------------------
// frontend code App.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

const SOCKET_SERVER_URL = "https://c5xltq-8000.csb.app";

const OFFER_OPTIONS = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};
const VIDEO_CONSTRAINTS = { audio: true, video: true };

const App = () => {
  const socket = useRef(null);
  const inputRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const connectedWithRef = useRef({});

  const [msgGot, setMsgGot] = useState("");

  const emitEventToServer = useCallback((eventName, data) => {
    socket.current.emit(eventName, data);
  }, []);

  const processSdp = useCallback(
    async (offer) => {
      try {
        await peerConnectionRef.current?.setLocalDescription(
          new RTCSessionDescription(offer),
        );
        const payload = {
          fromSocket: socket.id,
          toSocket: connectedWithRef.current?.socketId,
          data: offer,
        };
        emitEventToServer("sdp", payload);
      } catch (error) {
        console.error("Error processing SDP:", error);
      }
    },
    [emitEventToServer],
  );

  const createOffer = useCallback(async () => {
    try {
      const offer = await peerConnectionRef.current.createOffer(OFFER_OPTIONS);
      processSdp(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }, [processSdp]);

  const createAnswer = useCallback(async () => {
    try {
      if (peerConnectionRef.current.signalingState === "have-remote-offer") {
        const answer = await peerConnectionRef.current.createAnswer();
        processSdp(answer);
      }
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  }, [processSdp]);

  const handleIceCandidate = useCallback(
    (event) => {
      if (event.candidate) {
        emitEventToServer("candidate", {
          data: event.candidate,
          fromSocket: socket.id,
          toSocket: connectedWithRef.current?.socketId,
        });
      }
    },
    [emitEventToServer],
  );

  const handleTrack = useCallback((event) => {
    remoteVideoRef.current.srcObject = event.streams[0];
  }, []);

  const initializePeerConnection = () => {
    peerConnectionRef.current?.close(); // close peerconnection if already exist
    peerConnectionRef.current = new RTCPeerConnection(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = handleIceCandidate;
      peerConnectionRef.current.ontrack = handleTrack;

      peerConnectionRef.current.onnegotiationneeded = () => {
        if (peerConnectionRef.current.signalingState === "stable") {
          createOffer();
        }
      };
    }

    navigator.mediaDevices
      ?.getUserMedia(VIDEO_CONSTRAINTS)
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((elem) => {
          peerConnectionRef.current?.addTrack(elem, stream);
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  };

  useEffect(() => {
    socket.current = io.connect(SOCKET_SERVER_URL);

    socket.current.on(
      "connectedWithSomeOne",
      ({ shouldCreateOffer, connectedWith }) => {
        connectedWithRef.current = connectedWith;

        if (shouldCreateOffer) {
          createOffer();
        }

        socket.current.on("sdp", async ({ data }) => {
          await peerConnectionRef.current?.setRemoteDescription(
            new RTCSessionDescription(data),
          );
          if (peerConnectionRef.current) {
            createAnswer();
          }
        });

        socket.current.on("candidate", (candidate) => {
          peerConnectionRef.current?.addIceCandidate(candidate);
        });
      },
    );

    socket.current.on("gotMessage", (msg) => {
      setMsgGot(msg);
    });

    initializePeerConnection();

    return () => {
      socket.current?.disconnect();
    };
  }, [createAnswer, createOffer, handleIceCandidate, handleTrack]);

  const sendMessage = () => {
    const msg = inputRef.current.value;
    emitEventToServer("sendMessage", { from: socket.id, msg });
  };

  const connectWithSomeOne = () => {
    console.log("909--- peerConnectionRef", peerConnectionRef.current);
    if (peerConnectionRef.current?.signalingState === "stable") {
      console.log("stable called");
      initializePeerConnection();
      emitEventToServer("connectWithSomeone", socket.current?.id);
    } else {
      emitEventToServer("connectWithSomeone", socket.current?.id);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "10px" }}>
        <video
          style={{ backgroundColor: "black", width: "300px", height: "300px" }}
          ref={localVideoRef}
          autoPlay
        />
        <video
          style={{ backgroundColor: "black", width: "300px", height: "300px" }}
          ref={remoteVideoRef}
          autoPlay
        />
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <textarea
          type="text"
          placeholder="write something..."
          ref={inputRef}
          style={{
            width: "250px",
            height: "150px",
            padding: "20px",
            backgroundColor: "lightgray",
            color: "black",
          }}
        />
        <textarea
          placeholder="you will receive messages here..."
          // value={msgGot.join(" ")}
          value={msgGot}
          readOnly
          style={{
            width: "250px",
            height: "150px",
            padding: "20px",
            backgroundColor: "lightgray",
            color: "black",
          }}
        />
      </div>

      <button onClick={sendMessage}>send message</button>
      <div>
        <button onClick={() => connectWithSomeOne()}>
          connect with someone
        </button>
      </div>
    </div>
  );
};

export default App;

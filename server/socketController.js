const connectWithSomeone = ({ request_from_socket, usersWantTochat, io }) => {
  let goingToConnectWith;
  for (let key in usersWantTochat) {
    if (!usersWantTochat[key].connectionStatus) {
      if (usersWantTochat[key].socketId !== request_from_socket) {
        goingToConnectWith = usersWantTochat[key];
      }
    }
  }
  if (!goingToConnectWith) {
    return;
  }

  // user wants to connect
  let requestFrom = usersWantTochat[request_from_socket];
  requestFrom = {
    ...requestFrom,
    connectionStatus: true,
    connectedWith: goingToConnectWith?.socketId,
  };

  usersWantTochat[request_from_socket] = requestFrom;

  // going to connect with
  goingToConnectWith = {
    ...goingToConnectWith,
    connectionStatus: true,
    connectedWith: request_from_socket,
  };
  usersWantTochat[goingToConnectWith?.socketId] = goingToConnectWith;

  // notify user that he is connected with someone
  if (requestFrom.connectionStatus) {
    io.to(request_from_socket).emit("connectedWithSomeOne", {
      shouldCreateOffer: true,
      connectedWith: goingToConnectWith,
    });
    console.log("connect with backend", goingToConnectWith);
  }
  // notify user that he is connected with someone
  if (goingToConnectWith.connectionStatus) {
    io.to(goingToConnectWith.socketId).emit("connectedWithSomeOne", {
      shouldCreateOffer: false,
      connectedWith: requestFrom,
    });
    console.log("connect with backend", requestFrom);
  }
};

module.exports = { connectWithSomeone };

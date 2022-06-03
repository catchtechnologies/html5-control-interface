/**
 * Handles the WebSocket to the Messaging Server
 */

let cb = []; // the callback function to the DOM Handler
let connection;
let id; // the webpage's websocket uuid

/**
 * Starts
 * @param {Set} channels - channels the application is interested in
 * @param {Function} callback - a callback to call when new updates are available
 */
export function start(channels, callback) {
  cb.push(callback);
  startWebSocket(channels);
}

export function subscribe(channels, callback) {
  cb.push(callback);
  setTimeout(() => {
    if (connection) {
      const subscribeMessage = {
        action: "subscribe",
        options: Array.from(channels),
      };
      connection.send(JSON.stringify(subscribeMessage));
    }
  }, 1000);
}

/**
 * Sends an update from the DOM to the Messaging Server
 * @param {*} channel
 * @param {*} value
 */
export function update(channel, value) {
  if (connection) {
    const message = {
      action: "publish",
      options: {
        channel: channel,
        value: value,
        originId: id,
      },
    };
    connection.send(JSON.stringify(message));
  }
}

/**
 * Starts the web socket to the Messaging Server and passes the channels to it.
 * @param {Set} channels
 */
function startWebSocket(channels) {
  let protocol = "ws://";
  if (window.location.protocol === "https") {
    protocol = "wss://";
  }
  let token = window.location.search;
  // const wsUrl = protocol + window.location.host + "/updates" + token;
  const wsUrl = protocol + "localhost:8080/updates" + token;
  connection = new WebSocket(wsUrl);
  console.log("Connecting to: " + wsUrl);

  connection.onopen = () => {
    console.log("ws connected!");
    const subscribeMessage = {
      action: "subscribe",
      options: Array.from(channels),
    };
    connection.send(JSON.stringify(subscribeMessage));
  };

  connection.onclose = () => {
    // console.log('ws closed!');
  };

  connection.onerror = (error) => {
    console.log(`WebSocket error: ${error}`);
  };

  connection.onmessage = (m) => {
    if (m.data) {
      console.log("Received message from server: " + m.data);
      if (m.data === "ping") {
        connection.send("pong");
        return;
      } else if (m.data === "connected") {
        return;
      }
      try {
        console.log(m.data);
        const message = JSON.parse(m.data);
        if (message.action && message.options) {
          switch (message.action) {
            case "registration":
              if (message.options.id) {
                id = message.options.id;
              }
              break;
            case "update":
              handleMessage(message.options);
              break;
            default:
              break;
          }
        }
      } catch (e) {
        console.log("Error parsing JSON message: " + e);
        return e;
      }
    }
  };
}

/**
 * Handles a message, or an Array of messages coming from the Messaging Server
 * @param {Object|Array} message
 */
function handleMessage(message) {
  // if we are dealing with an array
  if (Array.isArray(message)) {
    message.forEach((m) => handleSingleMessage(m));
  } else {
    handleSingleMessage(message);
  }
}

/**
 * Handles a single message coming from the Messaging Server
 * @param {Object} message
 */
function handleSingleMessage(message) {
  const channel = message.channel;
  const value = message.value;
  cb.forEach((callback) => {
    callback(channel, value);
  });
}

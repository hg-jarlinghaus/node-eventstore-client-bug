import * as client from "node-eventstore-client";
const credentials = new client.UserCredentials("admin", "changeit");

const settings: client.ConnectionSettings = {
  defaultUserCredentials: credentials,
  verboseLogging: true,
  reconnectionDelay: 1000,
};
const endpoint = `tcp://127.0.0.1:1113`;
const connection = client.createConnection(settings, endpoint);

connection.once("connected", (tcpEndPoint) => {
  console.log(
    `Connected to eventstore at ${tcpEndPoint.host}:${tcpEndPoint.port}`
  );
  //console.log(`subscription.isSubscribedToAll: ${subscription.isSubscribedToAll}`)
});
connection.on("reconnecting", () => {
  console.log("reconnecting...");
});

connection.on("error", (err) =>
  console.log(`Error occurred on connection: ${err}`)
);

connection.on("closed", (reason) =>
  console.log(`Connection closed, reason: ${reason}`)
);

console.log("Starting");
console.log(`Connecting to ${endpoint}`);

(async function () {
  await connection.connect();
  const settings: client.PersistentSubscriptionSettings = {
    bufferSize: 500,
    checkpointAfterTime: 1000,
    checkpointMaxCount: 500,
    checkpointMinCount: 10,
    liveBufferSize: 500,
    maxRetryCount: 20,
    messageTimeoutMilliseconds: 10000,
    namedConsumerStrategy: "RoundRobin",
    readBatchSize: 20,
    subscriberMaxCount: 10,
  };
  await connection.createPersistentSubscription(
    "exampleStream",
    "exampleGroup",
    settings
  );
  connection
    .connectToPersistentSubscription(
      "exampleStream",
      "exampleGroup",
      () => console.log("Event Received"),
      () => console.log("Subscription Dropped"),
      undefined,
      20
    )
    .catch((err) => console.log(err));
})();

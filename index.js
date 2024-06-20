const express = require("express");
const https = require("https");
const mqtt = require("mqtt");
const { InfluxDB } = require("@influxdata/influxdb-client");
const constants = require("./constants");
const utils = require("./utils");
const secrets = require("./secrets");

const influxClient = new InfluxDB({
  url: constants.INFLUXDB_URL,
  token: secrets.INFLUXDB_TOKEN,
});

const influxWriteClient = influxClient.getWriteApi(
  (org = constants.INFLUXDB_ORG),
  (bucket = constants.INFLUXDB_BUCKET),
  (precision = constants.INFLUXDB_PRECISION)
);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: "*/*" }));

let lgw_requests = 0;

app.post("/lgw/f1", (req, res) => {
  lgw_requests++;
  let remote_ip = req.socket.remoteAddress;
  let remote_port = req.socket.remotePort;
  console.log("post data hit " + lgw_requests + remote_ip + remote_port);
  const authValue = req.header("Authorization");
  if (authValue && authValue == secrets.HOOK_AUTH_KEY) {
    if (req.body.uplink_message) {
      const device = req.body.end_device_ids.device_id;
      const payload = req.body.uplink_message.frm_payload;
      let data = utils.parseLorawanData(payload);
      data = utils.interpolateData(data_arr);
      utils.saveToInfluxDB(influxWriteClient, data, device);
      res.status(200).json({ msg: "ok" });
      return;
    }
  }
  console.log(req.body);
  res.status(400).json({ msg: "Bad Request" });
  return;
});

let cl_requests = 0;

app.post("/f1/:client_id([a-zA-Z0-9]{4})", (req, res) => {
  cl_requests++;
  let remote_ip = req.socket.remoteAddress;
  let remote_port = req.socket.remotePort;
  console.log("post data hit " + cl_requests + remote_ip + remote_port);
  const data = utils.parseRawSensorData(req.body);
  utils.saveToInfluxDB(influxWriteClient, data, req.params.client_id);
  res.status(200).json({ msg: "ok" });
  return;
});

app.get("/", (req, res) => {
  res.status(200).json({ msg: "ok" });
  return;
});

app.listen(constants.PORT_HTTP, () => {
  console.log(`HTTP Server started on port ${constants.PORT_HTTP}`);
});

const tls_options = {
  key: secrets.KEY_FILE,
  cert: secrets.CERT_FILE,
};

https.createServer(tls_options, app).listen(constants.PORT_HTTPS, () => {
  console.log(`HTTPS Server started on port ${constants.PORT_HTTPS}`);
});

// MQTT Client Setup

const mqtt_conf = {
  host: constants.HOSTNAME_MQTT,
  port: constants.PORT_MQTT,
  protocol: "mqtt",
  rejectUnauthorized: true,
};

const mqtts_conf = {
  host: constants.HOSTNAME_MQTT,
  port: constants.PORT_MQTTS,
  protocol: "mqtts",
  ca: secrets.CA_FILE,
  rejectUnauthorized: true,
};

const mqttc = mqtt.connect(mqtt_conf);

mqttc.on("connect", () => {
  console.log("Connected to MQTT broker with TLS");

  // Subscribe to topic
  const subscribe_topic = "/f1/#";
  mqttc.subscribe(subscribe_topic, (err) => {
    if (!err) {
      console.log(`Subscribed to topic ${subscribe_topic}`);
    }
  });

  // Publish a message
  const test_topic = "/f1/t001";
  const test_msg = "0011223344556677889900112233445566778899";
  console.log(`publishing test messages to test topic ${test_topic}`);
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      mqttc.publish(test_topic, test_msg);
    }, 2000);
  }
});

let sub_count = 0;

mqttc.on("message", (topic, message) => {
  // Message is Buffer
  console.log(
    `Received (${++sub_count}): ${message.length} on topic: ${topic}`
  );
  const regex = /^\/f1\/([a-zA-Z0-9]{4})$/;
  const device_id = regex.exec(topic);
  // console.log(device_id);
  if (device_id && device_id[1].length == 4) {
    const data = utils.parseRawSensorData(message);
    console.log(data);
    utils.saveToInfluxDB(influxWriteClient, data, device_id[1]);
  }
});

mqttc.on("error", (err) => {
  console.error("Connection error: ", err);
});

mqttc.on("close", () => {
  console.log("Connection closed");
});

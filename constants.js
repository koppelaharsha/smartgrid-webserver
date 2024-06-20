const HOSTNAME_MQTT = "tts.lora.local";

const PORT_HTTP = 8080;
const PORT_HTTPS = 8443;
const PORT_MQTT = 1883;
const PORT_MQTTS = 8883;

const INFLUXDB_URL = "http://localhost:8086";
const INFLUXDB_ORG = "smartgrid-workspace";
const INFLUXDB_BUCKET = "smartgrid-bucket";
const INFLUXDB_PRECISION = "ns";

module.exports = {
  HOSTNAME_MQTT,
  PORT_HTTP,
  PORT_HTTPS,
  PORT_MQTT,
  PORT_MQTTS,
  INFLUXDB_URL,
  INFLUXDB_ORG,
  INFLUXDB_BUCKET,
  INFLUXDB_PRECISION,
};

const { Point } = require("@influxdata/influxdb-client");

const frequency = 100;
const samples_per_cycle = 32;
const sampling_rate = samples_per_cycle * frequency;
let sample_duration = (1 / sampling_rate) * 1000000000; // in nanoseconds

function genData_test() {
  const MIN_SAMPLES = 100;
  const MAX_SAMPLES = 2000;
  const rand = Math.random() * (MAX_SAMPLES - MIN_SAMPLES) + MIN_SAMPLES;

  const MIN_AMPLITUDE = 0;
  const MAX_AMPLITUDE = 255;
  const data = [];

  for (let i = 0; i < rand; i++) {
    let t_angle = 2 * Math.PI * frequency * (i / sampling_rate);
    let sin_value = (1 + Math.sin(t_angle)) / 2;
    let t_data = MIN_AMPLITUDE + sin_value * (MAX_AMPLITUDE - MIN_AMPLITUDE);
    data.push(t_data);
  }
  return data;
}

const zeros = Array(samples_per_cycle / 2 - 1).fill(0);
function interpolateData(data_arr) {
  var data = [];
  data.push(0);
  data_arr.forEach((v) => {
    data.push(...zeros);
    data.push(v);
    data.push(...zeros);
    data.push(0);
  });
  return data;
}

function parseLorawanData(payload) {
  const data_str = Buffer.from(payload, "base64").toString("utf-8");
  const data_arr = [...data_str].map((c) => c.charCodeAt(0));
  return data_arr;
}

function parseRawSensorData(data) {
  const nums = [];
  if (data.length && data.length % 2 == 0) {
    for (let i = 0; i < data.length; i += 2) {
      let num = data.readUInt16LE(i);
      nums.push(num);
    }
    // console.log(numbers);
  }
  return nums;
}

function newPoint(time_ns, data, device) {
  return new Point("flourescent_sensor")
    .tag("insulator_id", device)
    .intField("sensor_data", data)
    .timestamp(time_ns);
}

var ts_ns = Date.now() * 1000000;
var point;

function saveToInfluxDB(writeClient, data, device) {
  var c_ts = Date.now() * 1000000;
  if (ts_ns < c_ts - 1000000000) ts_ns = c_ts;
  data.forEach((value) => {
    ts_ns += sample_duration;
    point = newPoint(ts_ns, value, device);
    writeClient.writePoint(point);
  });
  writeClient.flush();
  console.log("data flushed");
}

module.exports = {
  genData_test,
  interpolateData,
  parseLorawanData,
  parseRawSensorData,
  saveToInfluxDB,
};

const fs = require("fs");
const path = require("path");

const INFLUXDB_TOKEN =
  "45UW5WzuiOWzIVwYOXV168EFc1CbzaYpe0qLS9OlouEg5j4EHz7Ix7Ut4To46gX--GxZtAmv2K_U6qHe4U5KZA==";

const HOOK_AUTH_KEY = "Bearer 12345678";

const CA_FILE_PATH = path.resolve(__dirname, "../certs/cacert.pem");
const CERT_FILE_PATH = path.resolve(__dirname, "../certs/tts.cert.pem");
const KEY_FILE_PATH = path.resolve(__dirname, "../certs/tts.key.pem");

const CA_FILE = fs.readFileSync(CA_FILE_PATH);
const CERT_FILE = fs.readFileSync(CERT_FILE_PATH);
const KEY_FILE = fs.readFileSync(KEY_FILE_PATH);

module.exports = {
  INFLUXDB_TOKEN,
  HOOK_AUTH_KEY,
  CA_FILE,
  CERT_FILE,
  KEY_FILE,
};

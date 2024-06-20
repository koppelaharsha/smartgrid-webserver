# smartgrid-webserver
A webserver and an MQTT client for pico-wifi, a webserver for LoRaWAN Network Server webhook requests, to get end-device data and store it in an InfluxDB database.

## Configuration

- Configure `sampling_rate` / `sample_duration` in the file `utils.js` to adjust the duration between each sample sent by the end-device.

- Adjust hostname, ports and InfluxDB parameters in the file `constants.js`.

- Configure the InfluxDB token, certificate files in the file `secrets.js`.
 
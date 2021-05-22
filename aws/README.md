# AWS Device Connector

This project aims to connect AWS IoT to a device that can be reached via HTTP.
It may be extended to provide other methods of connection (e.g. lower level setting of pins) by implementing the DeviceClient interface and using that as a parameter for the Bridge.

## Setup

First, copy the [.env.sample](.env.sample) file to .env and replace the configuration with your specific settings.

### AWS Certificates

Download the certificates for your device and place them in a folder (`certs` is recommended and used by the compose file).
You'll have to provide the path to these files either via environment variables (see .env) or CLI parameters when running the project manually i.e. without npm.

### Showcasing

In the parent folder there's a [docker-compose.yml](../docker-compose.yml) which can be used to spin up an instance without installing any dependencies like node / npm.

### Documentation

There is a [docs](docs/index.html) folder that contains HTML documentation generated with [TypeDoc](https://typedoc.org/).

The script to generate the documentation can be invoked with `npm run doc`

### Development

#### NPM

First, run `npm install` to install all the dependencies.

#### Docker

Build the emulator image in the other folder via `docker build -t csiot/emulator ../emulator`.
Having done that you can run the container via `docker run -p 9292:9292 csiot/emulator`.
This makes the API accessible on `http://localhost:9292`.

#### Starting

Start the project by running `npm run dev`.

#### Building

The project can be built by running `npm run build`.

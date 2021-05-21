import { mqtt, io, iot } from 'aws-iot-device-sdk-v2'
import { TextDecoder } from 'util'

export type Args = {
  endpoint: string
  // eslint-disable-next-line camelcase
  ca_file: string
  cert: string
  key: string
  // eslint-disable-next-line camelcase
  client_id?: string
  topic: string
  region: string
  verbosity: 'fatal' | 'error' | 'warn' | 'none'
}

// TODO: placeholder for now
export type Message = {
  reported: Record<string, any>
  desired: Record<string, any>
}

export default class AwsClient {
  protected connection: mqtt.MqttClientConnection
  protected decoder = new TextDecoder('utf8')
  protected topic: string

  constructor(args: Args) {
    if (args.verbosity !== 'none') {
      const level: io.LogLevel = parseInt(io.LogLevel[args.verbosity.toUpperCase() as any])
      io.enable_logging(level)
    }

    this.topic = args.topic

    const config = this.buildConfig(args)
    this.connection = this.getMqttConnection(config)
  }

  private buildConfig(argv: Args) {
    const builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(argv.cert, argv.key)

    builder.with_certificate_authority_from_path(undefined, argv.ca_file)
    builder.with_clean_session(false)
    // create random client ID that matches default policy if none is provided
    builder.with_client_id(argv.client_id || 'sdk-nodejs' + Math.floor(Math.random() * 100000000))
    builder.with_endpoint(argv.endpoint)

    return builder.build()
  }

  private getMqttConnection(config: mqtt.MqttConnectionConfig) {
    const bootstrap = new io.ClientBootstrap()
    const client = new mqtt.MqttClient(bootstrap)
    return client.new_connection(config)
  }

  connect() {
    return this.connection.connect()
  }

  disconnect() {
    return this.connection.disconnect()
  }

  subscribe(callback: (message: Message) => void) {
    console.log('subscribing to ', this.topic)
    return this.connection.subscribe(this.topic, mqtt.QoS.AtLeastOnce, (_, payload) => {
      const decoded = this.decoder.decode(payload)
      const json = JSON.parse(decoded)
      const msg: Message = json.state
      callback(msg)
    })
  }

  publish(reported: Message['reported']) {
    const payload = { state: { reported } }
    const data = JSON.stringify(payload)
    return this.connection.publish(this.topic, data, mqtt.QoS.AtLeastOnce)
  }
}

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

/**
 *  A client to connect to AWS IoT on a single topic.
 */
export class AwsClient {
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

  /**
   * Builds a config for an AWS connection.
   *
   * @remarks Pretty basic, mostly taken from the AWS sdk sample.
   *
   * @param argv - An object containing configuration options.
   * @returns A config object.
   */
  private buildConfig(argv: Args) {
    const builder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(argv.cert, argv.key)

    builder.with_certificate_authority_from_path(undefined, argv.ca_file)
    builder.with_clean_session(false)
    // create random client ID that matches default policy if none is provided
    builder.with_client_id(argv.client_id || 'sdk-nodejs' + Math.floor(Math.random() * 100000000))
    builder.with_endpoint(argv.endpoint)

    return builder.build()
  }

  /**
   *
   * @param config - A config object
   * @returns An AWS connection that is not connected yet.
   */
  private getMqttConnection(config: mqtt.MqttConnectionConfig) {
    const bootstrap = new io.ClientBootstrap()
    const client = new mqtt.MqttClient(bootstrap)
    return client.new_connection(config)
  }

  /**
   * Connect to AWS IoT. Call this before trying to subscribe or publish.
   */
  async connect() {
    await this.connection.connect()
  }

  /**
   * Disconnect from AWS IoT.
   */
  async disconnect() {
    await this.connection.disconnect()
  }

  /**
   * Subscribe to the thing this client was created for.
   * Call {@link connect} before trying to subscribe.
   * @param callback - The callback to invoke whenever a message is received.
   * @returns Promise which resolves when the subscription succeeds and rejects if it fails.
   */
  async subscribe(callback: (message: Message) => void) {
    console.log('subscribing to ', this.topic)
    await this.connection.subscribe(this.topic, mqtt.QoS.AtLeastOnce, (_, payload) => {
      const decoded = this.decoder.decode(payload)
      const json = JSON.parse(decoded)
      const msg: Message = json.state
      callback(msg)
    })
  }

  /**
   * Publish a payload to this client's topic.
   * Call {@link connect} before trying to publish.
   * @param reported - The state to be published.
   * @returns Promise that resolves when the message has been published.
   */
  async publish(reported: Message['reported']) {
    const payload = { state: { reported } }
    const data = JSON.stringify(payload)
    await this.connection.publish(this.topic, data, mqtt.QoS.AtLeastOnce)
  }
}

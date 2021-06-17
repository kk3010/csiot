import { mqtt, io, iot, iotshadow } from 'aws-iot-device-sdk-v2'
import { useLogging } from './logger'

export type Args = {
  endpoint: string
  // eslint-disable-next-line camelcase
  ca_file: string
  cert: string
  key: string
  // eslint-disable-next-line camelcase
  thing_name: string
  region: string
  verbosity: 'fatal' | 'error' | 'warn' | 'none'
}

// TODO: placeholder for now
export type Message = {
  reported: Record<string, any>
  desired: Record<string, any>
}

export type SubscriberFunction = (state: Message['desired']) => void

/**
 *  A client to connect to AWS IoT on a single topic.
 */
export class AwsClient {
  protected connection: mqtt.MqttClientConnection
  protected logger = useLogging('AWS Client')
  protected shadowClient: iotshadow.IotShadowClient
  protected thingName: string
  protected subsribers: SubscriberFunction[] = []

  constructor(args: Args) {
    if (args.verbosity !== 'none') {
      const level: io.LogLevel = parseInt(io.LogLevel[args.verbosity.toUpperCase() as any])
      io.enable_logging(level)
    }

    const config = this.buildConfig(args)
    this.connection = this.getMqttConnection(config)
    this.shadowClient = new iotshadow.IotShadowClient(this.connection)
    this.thingName = args.thing_name
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
    builder.with_client_id('sdk-nodejs-' + argv.thing_name)
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
   * Connect to AWS IoT. After this you'll want to call {@link AwsClient.init} in most cases.
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
   * Subscribe to the update and get topics and send an initial get request to initialize the shadow state locally.
   * The client needs to be connected for this funtion to complete.
   */
  async init() {
    if (this.subsribers.length === 0) {
      this.logger.warn('No subscribers yet, so the state will probably not be set correctly.')
    }
    await this.shadowClient.subscribeToGetShadowAccepted(
      { thingName: this.thingName },
      mqtt.QoS.AtLeastOnce,
      (e, res) => {
        if (e) {
          this.logger.error(e.message)
          return
        }
        const state = res?.state?.desired
        if (state) {
          this.logger.info('Get received, desired state: ' + JSON.stringify(state))
          this.onUpdateReceived(state)
        }
      }
    )
    await this.shadowClient.subscribeToUpdateShadowAccepted(
      { thingName: this.thingName },
      mqtt.QoS.AtLeastOnce,
      (e, res) => {
        if (e) {
          this.logger.error(e.message)
          return
        }
        const state = res?.state?.desired
        if (state) {
          this.logger.info('Update accepted, desired state: ' + JSON.stringify(state))
          this.onUpdateReceived(state)
        }
      }
    )
    this.logger.info('Initializing client by publishing to shadow get topic')
    await this.shadowClient.publishGetShadow({ thingName: this.thingName }, mqtt.QoS.AtLeastOnce)
  }

  /**
   * Notify all subscribers of a new desired state.
   * @param state - The desired shadow state
   */
  private onUpdateReceived(state: Message['desired']) {
    this.subsribers.forEach((callback) => callback(state))
  }

  /**
   * Subscribe to the thing's shadow this client was created for.
   * Call this before connecting to receive the initial state.
   * @param callback - The callback to invoke whenever a message is received.
   */
  async subscribe(callback: SubscriberFunction) {
    this.subsribers.push(callback)
  }

  /**
   * Publish a payload to this client's topic.
   * Call {@link AwsClient.connect} before trying to publish.
   * @param reported - The state to be published.
   * @returns Promise that resolves when the message has been published.
   */
  async publishReportedState(reported: Message['reported']) {
    this.logger.info('Publishing reported state ' + JSON.stringify(reported))
    await this.shadowClient.publishUpdateShadow(
      { thingName: this.thingName, state: { reported } },
      mqtt.QoS.AtLeastOnce
    )
  }
}

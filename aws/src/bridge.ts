import { AwsClient } from './awsClient'
import { useLogging } from './logger'
import type { Message } from './awsClient'
import type { IBridge } from './IBridge'
import type { IDeviceClient, State } from './IDeviceClient'

export class Bridge implements IBridge {
  protected logger = useLogging('Bridge')
  protected state: State = {}

  /**
   * @param awsClient - Instance of an AWS client
   * @param deviceClient - Instance of a client to connect to a device
   */
  constructor(protected awsClient: AwsClient, protected deviceClient: IDeviceClient) {}

  /**
   * Update a device upon receiving a message from AWS.
   *
   * @param message - The message that was received.
   * @returns An empty promise that resolves when the device has been updated.
   */
  private async onMessageReceived(desired: Message['desired']) {
    this.logger.info('Received: ', desired)
    await this.deviceClient.updateState(desired)
    this.state = { ...this.state, ...desired }
  }

  /**
   * Publishes messages to AWS IoT periodically.
   *
   * @returns A Promise that only ever rejects.
   */
  private publishMessagesPeriodically() {
    return new Promise<never>((resolve, reject) => {
      const intervalFn = async () => {
        try {
          const state = await this.deviceClient.getState()
          if (JSON.stringify(state) !== JSON.stringify(this.state)) {
            this.state = state
            await this.awsClient.publishReportedState(state)
          }
        } catch (e) {
          reject(e)
        }
        setTimeout(intervalFn, 1000)
      }
      intervalFn()
    })
  }

  /**
   * Invoked when the connection is about to be aborted due to an error.
   * Disconnects from AWS, logs errors to console and exits process.
   * @param e - The initial error that causes the bridge to exit.
   */
  private async cleanup(e: any) {
    const onError = (disconnectError?: any) => {
      if (disconnectError) {
        this.logger.error('Could not disconnect.')
        this.logger.error(disconnectError)
        this.logger.error('See next lines for original error')
      } else {
        this.logger.error('Exiting due to error. See following message for more info.')
      }
      this.logger.error(e)
    }
    try {
      await this.awsClient.disconnect()
      onError()
    } catch (disconnectError) {
      onError(disconnectError)
    } finally {
      process.exit(1)
    }
  }

  async loop() {
    try {
      await this.awsClient.subscribe((msg) => this.onMessageReceived(msg).catch((e) => this.cleanup(e)))
      await this.awsClient.connect()
      await this.awsClient.init()
      await this.publishMessagesPeriodically()
    } catch (e) {
      await this.cleanup(e)
    }
  }
}

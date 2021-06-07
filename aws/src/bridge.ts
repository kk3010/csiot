import { AwsClient } from './awsClient'
import type { Message } from './awsClient'
import { IBridge } from './IBridge'
import { IDeviceClient } from './IDeviceClient'
import { useLogging } from './logger'

export class Bridge implements IBridge {
  protected logger = useLogging('Bridge')

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
  private async onMessageReceived(message: Message) {
    this.logger.info('received: ', message)
    const reported = message.reported
    // toggle 'on' state for showcasing
    reported.on = !reported.on
    await this.deviceClient.updateState(reported)
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
          await this.awsClient.publish(state)
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
    const onError = (originalError: any, disconnectError?: any) => {
      if (disconnectError) {
        this.logger.error('Could not disconnect.')
        this.logger.error(disconnectError)
        this.logger.error('See next lines for original error')
      } else {
        this.logger.error('Exiting due to error. See following message for more info.')
      }
      this.logger.error(originalError)
    }
    try {
      await this.awsClient.disconnect()
      onError(e)
    } catch (disconnectError) {
      onError(e, disconnectError)
    } finally {
      process.exit(1)
    }
  }

  async loop() {
    try {
      await this.awsClient.connect()
      await this.awsClient.subscribe((msg) => this.onMessageReceived(msg).catch((e) => this.cleanup(e)))
      await this.publishMessagesPeriodically()
    } catch (e) {
      await this.cleanup(e)
    }
  }
}

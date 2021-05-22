import { AwsClient } from './awsClient'
import type { Message } from './awsClient'
import { IBridge } from './IBridge'
import { IDeviceClient } from './IDeviceClient'

export class Bridge implements IBridge {
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
    console.log('received: ', message)
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

  async loop() {
    try {
      await this.awsClient.connect()
      await this.awsClient.subscribe((msg) => this.onMessageReceived(msg))
      await this.publishMessagesPeriodically()
    } catch (e) {
      await this.awsClient.disconnect().catch(console.error)
      console.error('Exiting due to error. See following message for more info.')
      console.error(e)
      process.exit(1)
    }
  }
}

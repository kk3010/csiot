import AwsClient from './awsClient'
import DeviceClient from './deviceClient'
import type { Message } from './awsClient'

export default class Bridge {
  constructor(protected awsClient: AwsClient, protected deviceClient: DeviceClient) {}

  onMessageReceived(message: Message) {
    console.log('received: ', message)
    const reported = message.reported
    // toggle 'on' state for showcasing
    reported.on = !reported.on
    this.deviceClient.updateState(reported)
  }

  publishMessagesPeriodically() {
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
   * Returns a promise that never resolves but rejects when an error is thrown while publishing
   */
  async loop() {
    await this.awsClient.subscribe((msg) => this.onMessageReceived(msg))

    return this.publishMessagesPeriodically()
  }
}

import fetch from 'node-fetch'
import { IDeviceClient } from './IDeviceClient'
import type { State } from './IDeviceClient'

/**
 * Implementation of a device that can be manipulated via HTTP
 */
export class HttpDeviceClient implements IDeviceClient {
  constructor(protected apiUrl: string) {}

  async getState() {
    const res = await fetch(this.apiUrl)
    const { state } = await res.json()
    return state as State
  }

  async updateState(state: State) {
    await fetch(this.apiUrl, { method: 'POST', body: JSON.stringify(state) })
  }
}

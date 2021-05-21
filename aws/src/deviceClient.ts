import fetch from 'node-fetch'

type State = Record<string, any>

export default class DeviceClient {
  constructor(protected apiUrl: string) {}

  async getState() {
    const res = await fetch(this.apiUrl)
    const json = await res.json()
    return json.state as State
  }

  async updateState(state: State) {
    const res = await fetch(this.apiUrl, { method: 'POST', body: JSON.stringify(state) })
    return res
  }
}

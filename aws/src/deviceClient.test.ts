import { mocked } from 'ts-jest/utils'
import { DeviceClient } from './deviceClient';
import type { IDeviceClient, State } from './IDeviceClient'
import fetch from "node-fetch";

jest.mock('node-fetch')
const { Response, Headers } = jest.requireActual('node-fetch')

// typescript helper that makes the compiler aware of the mock
const mockedFetch = mocked(fetch, true)

// Example adapted from https://fetch.spec.whatwg.org/#example-headers-class
const headers = new Headers({
  'Content-Type': 'application/json',
})

const responseInit = {
  status: 200,
  statusText: 'ok',
  headers: headers
}

const mockFetchValue = (state: State) => {
  const response = new Response(JSON.stringify({ state }), responseInit)
  mockedFetch.mockResolvedValueOnce(response)
}

describe('HTTP Device Client', () => {
  let client: IDeviceClient
  const url = "example.com"

  beforeEach(() => {
    client = new DeviceClient(url)
    mockedFetch.mockReset()
  })

  it('Can read state', async () => {
    const state: State = { id: 1, on: false }
    mockFetchValue(state)
    const res = await client.getState()
    expect(mockedFetch).toBeCalledWith(url)
    expect(res).toEqual(state)
  })

  it('Can set state', async () => {
    const state: State = { id: 2, on: true }
    mockFetchValue(state)
    await client.updateState(state)
    expect(mockedFetch).toBeCalledWith(url, { method: "POST", body: JSON.stringify(state) })
  })
})
export type State = Record<string, any>

/**
 * A class that connects to a device and can read / update its state.
 */
export interface IDeviceClient {
  /**
   *  A method to read a device's state. Can be asynchronous.
   *
   * @returns The state, maybe wrapped in a promise.
   */
  getState(): Promise<State> | State

  /**
   * A method to set a device's state. Can be asynchronous.
   *
   * @param State - The new state
   * @returns Resolves when the state has been updated.
   */
  updateState(state: State): Promise<void> | void
}

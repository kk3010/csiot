/**
 * Bridges the gap between AWS IoT and a device.
 */
export interface IBridge {
  /**
   * A continuous loop that syns AWS and a device.
   *
   * @returns A Promise that never resolves.
   */
  loop(): Promise<void>
}

import { Bridge } from './bridge'
import { useCli } from './cli'
import { AwsClient } from './awsClient'
import { HttpDeviceClient } from './httpDeviceClient'
import { createLogger } from './logger'

const args = useCli()

createLogger(args.verbosity)

const aws = new AwsClient(args)
const device = new HttpDeviceClient(args.api_url)

const bridge = new Bridge(aws, device)

bridge.loop()

import { Bridge } from './bridge'
import { useCli } from './cli'
import { AwsClient } from './awsClient'
import { DeviceClient } from './deviceClient'

const args = useCli()
const aws = new AwsClient(args)
const device = new DeviceClient(args.api_url)

const bridge = new Bridge(aws, device)

bridge.loop()

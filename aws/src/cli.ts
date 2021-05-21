import yargs from 'yargs'
import { Args } from './awsClient'

// eslint-disable-next-line camelcase
export type CliArgs = Args & { api_url: string }

export function useCli() {
  return yargs
    .command('*', false, (yargs) => {
      yargs
        .option('endpoint', {
          alias: 'e',
          description:
            'Your AWS IoT custom endpoint, not including a port. ' +
            'Ex: "abcd123456wxyz-ats.iot.us-east-1.amazonaws.com"',
          type: 'string',
          required: true,
        })
        .option('ca_file', {
          alias: 'r',
          description: 'FILE: path to a Root CA certficate file in PEM format.',
          type: 'string',
          required: true,
        })
        .option('cert', {
          alias: 'c',
          description: 'FILE: path to a PEM encoded certificate to use with mTLS',
          type: 'string',
          required: true,
        })
        .option('key', {
          alias: 'k',
          description: 'FILE: Path to a PEM encoded private key that matches cert.',
          type: 'string',
          required: true,
        })
        .option('client_id', {
          alias: 'C',
          description: 'Client ID for MQTT connection.',
          type: 'string',
          required: false,
        })
        .option('topic', {
          alias: 't',
          description: 'STRING: Targeted topic',
          type: 'string',
          required: true,
          default: 'test/topic',
        })
        .option('region', {
          alias: 's',
          description:
            'If you specify --use_websocket, this ' +
            'is the region that will be used for computing the Sigv4 signature',
          type: 'string',
          required: true,
        })
        .option('api_url', {
          alias: 'd',
          description: 'The device\'s REST API URL, e.g. "http://emulator:9292/gpios/led_green"',
          type: 'string',
          required: true,
        })
        .option('verbosity', {
          alias: 'v',
          description: 'BOOLEAN: Verbose output',
          type: 'string',
          default: 'none',
          choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'none'],
        })
        .help()
        .alias('help', 'h')
    })
    .parse() as unknown as CliArgs
}

# Jupiter

Project description here

## Contributors

- your
- names
- here
- pls

## Setup

Run `git pull --recurse-submodules` to pull the submodule containing the device emulator.

### AWS

Make sure you're signed in to AWS in the console - refer to [the AWS CLI docs on how to do that](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)

Then get your 12-digit account ID and save it to an environment variable by running `export TF_VAR_aws_account=$(aws sts get-caller-identity --query Account --output text)`. We'll need it later.

Also, download the Amazon root CA and place it under `certs/`, e.g. by doing `curl https://www.amazontrust.com/repository/AmazonRootCA1.pem >> certs/root-CA.crt`.
This matches the default configuration the compose file uses.

### Node client

Refer to the README in the `aws` folder for instructions on how to setup the client. You'll need at least the .env file or provide the configuration via environment variables in the compose file.

### Terraform

Now you should be able to provision the required infrastructure to your account by running `terraform apply` from within the terraform folder.

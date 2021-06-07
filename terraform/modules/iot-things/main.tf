# create things
resource "aws_iot_thing" "things" {
  name = var.thing
}

# create certificates
resource "aws_iot_certificate" "things" {
  active = true
}

# create policy
# see https://docs.aws.amazon.com/iot/latest/developerguide/iot-policy-actions.html
resource "aws_iot_policy" "things" {
  name   = var.thing
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish",
        "iot:Receive",
        "iot:Republish"
      ],
      "Resource": [
        "arn:aws:iot:${var.aws_region}:${var.aws_account}:topic/$aws/things/${var.thing}/shadow/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Subscribe"
      ],
      "Resource": [
        "arn:aws:iot:${var.aws_region}:${var.aws_account}:topicfilter/$aws/things/${var.thing}/shadow/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect"
      ],
      "Resource": [
        "arn:aws:iot:${var.aws_region}:${var.aws_account}:client/sdk-nodejs-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:GetThingShadow",
        "iot:UpdateThingShadow"
      ],
      "Resource": [
        "arn:aws:iot:${var.aws_region}:${var.aws_account}:thing/${var.thing}"
      ]
    }
  ]
}
EOF
}

# attach policy to certificate
resource "aws_iot_policy_attachment" "thing_things" {
  policy = aws_iot_policy.things.name
  target = aws_iot_certificate.things.arn
}


# attache certificate to thing
resource "aws_iot_thing_principal_attachment" "things" {
  principal = aws_iot_certificate.things.arn
  thing     = aws_iot_thing.things.name
}

# save private key under ../certs/<thingName>/private.key
resource "local_file" "private_key" {
  sensitive_content = aws_iot_certificate.things.private_key
  filename          = "${path.root}/../certs/${var.thing}/private.key"
}

# save certificate under ../certs/<thingName>/cert.pem
resource "local_file" "cert" {
  content  = aws_iot_certificate.things.certificate_pem
  filename = "${path.root}/../certs/${var.thing}/cert.pem"
}

# create things
resource "aws_iot_thing" "things" {
  for_each = toset(var.things)
  name     = each.value
}

# create certificates
resource "aws_iot_certificate" "things" {
  for_each = toset(var.things)
  active   = true
}

# create policy
# see https://docs.aws.amazon.com/iot/latest/developerguide/iot-policy-actions.html
resource "aws_iot_policy" "things" {
  for_each = toset(var.things)
  name     = each.value
  policy   = <<EOF
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
        "arn:aws:iot:${var.aws_region}:${var.aws_account}:topic/$aws/things/${each.value}/shadow/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Subscribe"
      ],
      "Resource": [
        "arn:aws:iot:${var.aws_region}:${var.aws_account}:topicfilter/$aws/things/${each.value}/shadow/*"
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
        "arn:aws:iot:${var.aws_region}:${var.aws_account}:thing/${each.value}"
      ]
    }
  ]
}
EOF
}

# attach policy to certificate
resource "aws_iot_policy_attachment" "thing_things" {
  for_each = toset(var.things)
  policy   = aws_iot_policy.things[each.value].name
  target   = aws_iot_certificate.things[each.value].arn
}


# attache certificate to thing
resource "aws_iot_thing_principal_attachment" "things" {
  for_each  = toset(var.things)
  principal = aws_iot_certificate.things[each.value].arn
  thing     = aws_iot_thing.things[each.value].name
}

# save private key under ../certs/<thingName>/private.key
resource "local_file" "private_key" {
  for_each          = toset(var.things)
  sensitive_content = aws_iot_certificate.things[each.value].private_key
  filename          = "${path.module}/../certs/${each.value}/private.key"
}

# save certificate under ../certs/<thingName>/cert.pem
resource "local_file" "cert" {
  for_each = toset(var.things)
  content  = aws_iot_certificate.things[each.value].certificate_pem
  filename = "${path.module}/../certs/${each.value}/cert.pem"
}

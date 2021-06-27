resource "aws_iam_role" "detector_role" {
  name = "detector_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "iotevents.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "detector_role" {
  name = "update_shadow_policy"
  role = aws_iam_role.detector_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "iot:UpdateThingShadow"
        Effect   = "Allow"
        Resource = "arn:aws:iot:${var.aws_region}:${var.aws_account}:thing/*"
      },
      {
        Action   = "iot:Publish"
        Effect   = "Allow"
        Resource = "arn:aws:iot:${var.aws_region}:${var.aws_account}:topic/*"
      },
      {
        "Effect"   = "Allow"
        "Action"   = "iotevents:BatchPutMessage"
        "Resource" = "arn:aws:iotevents:${var.aws_region}:${var.aws_account}:input/*"
      },
    ]
  })
}

resource "aws_cloudformation_stack" "iot_events_stack" {
  name = "IoTEventsStack"
  parameters = {
    "RoleArn" = aws_iam_role.detector_role.arn
  }
  template_body = file("${path.module}/cloudFormationTemplate.yaml")
}


# explicitly create topic rules here because we can't auto-generate the corresponding input's name
resource "aws_iot_topic_rule" "forward_temperature" {
  name        = "forward_temperature"
  enabled     = true
  sql_version = "2016-03-23"
  sql         = "SELECT state.reported.value FROM '$aws/things/temperature/shadow/update/accepted'"
  iot_events {
    input_name = "temp_sensor_input"
    role_arn   = aws_iam_role.iot_rules_role.arn
  }
}

resource "aws_iot_topic_rule" "forward_humidity" {
  name        = "forward_humidity"
  enabled     = true
  sql_version = "2016-03-23"
  sql         = "SELECT state.reported.value FROM '$aws/things/humidity/shadow/update/accepted'"
  iot_events {
    input_name = "humidity_sensor_input"
    role_arn   = aws_iam_role.iot_rules_role.arn
  }
}

resource "aws_iot_topic_rule" "forward_motion" {
  name        = "forward_motion"
  enabled     = true
  sql_version = "2016-03-23"
  sql         = "SELECT state.reported.open FROM '$aws/things/motion/shadow/update/accepted'"
  iot_events {
    input_name = "motion_sensor_input"
    role_arn   = aws_iam_role.iot_rules_role.arn
  }
}

resource "aws_iot_topic_rule" "forward_door_lock" {
  name        = "forward_door_lock"
  enabled     = true
  sql_version = "2016-03-23"
  sql         = "SELECT state.reported.open FROM '$aws/things/door_lock/shadow/update/accepted'"
  iot_events {
    input_name = "door_lock_input"
    role_arn   = aws_iam_role.iot_rules_role.arn
  }
}

resource "aws_iot_topic_rule" "forward_heating" {
  name        = "forward_heating"
  enabled     = true
  sql_version = "2016-03-23"
  sql         = "SELECT state.reported.on FROM '$aws/things/heating/shadow/update/accepted'"
  iot_events {
    input_name = "heating_input"
    role_arn   = aws_iam_role.iot_rules_role.arn
  }
}

resource "aws_iam_role" "iot_rules_role" {
  name = "iot_rules_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "iot.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "allow_send_inputs" {
  name = "allow_send_inputs"
  role = aws_iam_role.iot_rules_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "iotevents:BatchPutMessage"
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

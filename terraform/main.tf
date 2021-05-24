module "iot_things" {
  for_each    = toset(var.things)
  source      = "./modules/iot-things"
  thing       = each.value
  aws_account = var.aws_account
  aws_region  = var.aws_region
}

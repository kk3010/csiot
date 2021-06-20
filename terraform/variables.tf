variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "aws_account" {
  type        = string
  description = "Your 12-digit account ID. Find it by running aws sts get-caller-identity --query Account --output text"
}

variable "aws_profile" {
  type        = string
  description = "The profile to use."
  default     = "default"
}

variable "things" {
  description = "All the things"
  type        = list(string)
  default     = ["heating", "fan", "door_lock", "temperature", "alarm", "motion", "humidifier", "humidity"]
}

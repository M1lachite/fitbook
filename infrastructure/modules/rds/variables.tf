variable "project" {
  type = string
}

variable "db_subnet_ids" {
  type = list(string)
}

variable "sg_db_id" {
  type = string
}

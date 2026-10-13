terraform {
  backend "s3" {
    bucket       = "fit-tygryski-s3-bucket"
    key          = "infrastructure/terraform.tfstate"
    region       = "eu-central-1"
    use_lockfile = true
  }
}

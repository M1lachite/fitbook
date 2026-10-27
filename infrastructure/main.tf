module "network" {
  source  = "./modules/network"
  project = var.project
  region  = var.region
}

module "security" {
  source  = "./modules/security"
  project = var.project
  region  = var.region
  vpc_id  = module.network.vpc_id
}

module "compute" {
  source        = "./modules/compute"
  project       = var.project
  web_subnet_id = module.network.web_subnet_ids[0]
  app_subnet_id = module.network.app_subnet_ids[0]
  sg_web_id     = module.security.sg_web_id
  sg_app_id     = module.security.sg_app_id

  depends_on = [module.network]
}

module "rds" {
  source        = "./modules/rds"
  project       = var.project
  db_subnet_ids = module.network.db_subnet_ids
  sg_db_id      = module.security.sg_db_id
}

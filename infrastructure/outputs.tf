output "vpc_id" {
  value = module.network.vpc_id
}

output "subnet_ids" {
  value = {
    web = module.network.web_subnet_ids
    app = module.network.app_subnet_ids
    db  = module.network.db_subnet_ids
  }
}

output "security_group_ids" {
  value = {
    web = module.security.sg_web_id
    app = module.security.sg_app_id
    db  = module.security.sg_db_id
  }
}

output "web_public_ip" {
  value = module.compute.web_public_ip
}

output "private_ips" {
  value = module.compute.private_ips
}

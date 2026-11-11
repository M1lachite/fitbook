output "web_public_ip" {
  value = aws_eip.web.public_ip
}

output "private_ips" {
  value = {
    web = aws_instance.web.private_ip
    app = aws_instance.app.private_ip
  }
}

output "ecr_repository_urls" {
  value = {
    frontend = aws_ecr_repository.frontend.repository_url
    backend  = aws_ecr_repository.backend.repository_url
  }
}
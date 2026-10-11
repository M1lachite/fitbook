output "web_public_ip" {
  value = aws_instance.web.public_ip
}

output "private_ips" {
  value = {
    web = aws_instance.web.private_ip
    app = aws_instance.app.private_ip
    db  = aws_instance.db.private_ip
  }
}

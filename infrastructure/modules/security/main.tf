# Adresy usługi EC2 Instance Connect (łączenie z konsoli AWS)
data "aws_ec2_managed_prefix_list" "instance_connect" {
  name = "com.amazonaws.${var.region}.ec2-instance-connect"
}

# Web - ruch z internetu
resource "aws_security_group" "web" {
  name        = "${var.project}-web-sg"
  description = "Security Group dla serwerow Web"
  vpc_id      = var.vpc_id

  # SSH tylko z EC2 Instance Connect, nie z całego internetu
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.instance_connect.id]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-web-sg" }
}

# App - ruch tylko z Web
resource "aws_security_group" "app" {
  name        = "${var.project}-app-sg"
  description = "Security Group dla aplikacji"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  ingress {
    from_port       = -1
    to_port         = -1
    protocol        = "icmp"
    security_groups = [aws_security_group.web.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project}-app-sg" }
}

# DB - ruch tylko z App
resource "aws_security_group" "db" {
  name        = "${var.project}-db-sg"
  description = "Security Group dla bazy danych"
  vpc_id      = var.vpc_id

  # 5432 = PostgreSQL (dla MySQL: 3306)
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  # Brak egress - baza sama nie nawiązuje połączeń

  tags = { Name = "${var.project}-db-sg" }
}

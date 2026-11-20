# Obraz Amazon Linux 2023
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  subnet_id              = var.web_subnet_id
  vpc_security_group_ids = [var.sg_web_id]

  # Ta sama rola co dla app (SSM + pobieranie z ECR)
  iam_instance_profile = "${var.project}-ec2-ssm"

  # Przy pierwszym starcie: Docker
  user_data                   = <<-EOT
    #!/bin/bash
    dnf install -y docker
    systemctl enable --now docker
    usermod -aG docker ssm-user || true
  EOT
  user_data_replace_on_change = true

  tags = { Name = "${var.project}-ec2-web" }
}

# Stały publiczny adres dla web
resource "aws_eip" "web" {
  domain   = "vpc"
  instance = aws_instance.web.id

  tags = { Name = "${var.project}-web-eip" }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  subnet_id              = var.app_subnet_id
  vpc_security_group_ids = [var.sg_app_id]

  # Rola utworzona ręcznie przez admina (AmazonSSMManagedInstanceCore) -
  # pozwala wejść na instancję przez Session Manager
  iam_instance_profile = "${var.project}-ec2-ssm"

  # Przy pierwszym starcie: Docker, git i klient PostgreSQL (psql)
  user_data                   = <<-EOT
    #!/bin/bash
    dnf install -y docker git postgresql16
    systemctl enable --now docker
    usermod -aG docker ssm-user || true
  EOT
  user_data_replace_on_change = true

  tags = { Name = "${var.project}-ec2-app" }
}

# Repozytoria obrazów Dockera (force_delete, żeby terraform destroy działał z obrazami w środku)
resource "aws_ecr_repository" "frontend" {
  name         = "${var.project}-frontend"
  force_delete = true
}

resource "aws_ecr_repository" "backend" {
  name         = "${var.project}-backend"
  force_delete = true
}
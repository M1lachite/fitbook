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

  tags = { Name = "${var.project}-ec2-web" }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  subnet_id              = var.app_subnet_id
  vpc_security_group_ids = [var.sg_app_id]

  tags = { Name = "${var.project}-ec2-app" }
}

resource "aws_instance" "db" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  subnet_id              = var.db_subnet_id
  vpc_security_group_ids = [var.sg_db_id]

  tags = { Name = "${var.project}-ec2-db" }
}

# Podsieci, w których może działać baza (RDS wymaga co najmniej dwóch stref)
resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-db-subnets"
  subnet_ids = var.db_subnet_ids

  tags = { Name = "${var.project}-db-subnets" }
}

# Baza PostgreSQL w podsieciach prywatnych
resource "aws_db_instance" "main" {
  identifier = "${var.project}-db"

  engine         = "postgres"
  engine_version = "16"
  instance_class = "db.t4g.micro"

  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "fitbook"
  username = "fitbook_admin"

  # Hasło generuje AWS i trzyma w Secrets Manager - nie ma go w kodzie ani w state
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.sg_db_id]
  publicly_accessible    = false
  multi_az               = false

  # Środowisko testowe - bez kopii zapasowych i bez snapshotu przy usuwaniu
  backup_retention_period = 0
  skip_final_snapshot     = true
  apply_immediately       = true

  tags = { Name = "${var.project}-rds" }
}

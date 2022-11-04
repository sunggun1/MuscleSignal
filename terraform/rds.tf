resource "aws_db_subnet_group" "example"{
  name = "mysqldb"
  subnet_ids = ["${aws_subnet.public1.id}","${aws_subnet.public2.id}","${aws_subnet.public3.id}","${aws_subnet.public4.id}"]

  tags={
    Name = "mysqldb"
  }
}

resource "aws_security_group" "db_instance"{
  name = "mysqldb"
  vpc_id = aws_vpc.vpc.id
}

resource "aws_security_group_rule" "allow_db_ingress_access"{
  type = "ingress"
  from_port = "3306"
  to_port = "3306"
  protocol = "tcp"
  security_group_id = aws_security_group.db_instance.id
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_security_group_rule" "allow_db_egress_access"{
  type = "egress"
  from_port = 0
  to_port = 0
  protocol = "-1"
  security_group_id = aws_security_group.db_instance.id
  cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_db_instance" "web_db" {
  allocated_storage = 100
  engine                    = "mysql"
  engine_version            = "8.0.28"
  instance_class            = "db.t3.micro"
  username                  = "admin"
  password                  = "password"
  name                      = "mydb"
  db_subnet_group_name      = aws_db_subnet_group.example.id
  vpc_security_group_ids    = [aws_security_group.db_instance.id]
  multi_az                  = false
  storage_type              = "gp2"
  availability_zone         = "ap-northeast-2a"

  skip_final_snapshot       = true
  publicly_accessible       = true
  tags = {
    Name = "mysqldb-instance"
  }
}


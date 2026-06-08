###############################################################################
# 1. Fetch Secrets from AWS Secrets Manager
###############################################################################
data "aws_secretsmanager_secret_version" "creds" {
  secret_id = "db-cred"
}

locals {
  db_cred = jsondecode(data.aws_secretsmanager_secret_version.creds.secret_string)
}


###############################################################################
# 2. Basic VPC (Public only)
###############################################################################
data "aws_availability_zones" "available" {}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.17.0"

  name = "dev-vpc"
  cidr = "10.0.0.0/16"

  azs            = slice(data.aws_availability_zones.available.names, 0, 2)
  public_subnets = ["10.0.0.0/24", "10.0.1.0/24"]

  enable_nat_gateway = false
  create_igw         = true

  tags = {
    Name        = "dev-vpc"
    Environment = "dev"
  }
}

###############################################################################
# 3. RDS (Postgres) in Public Subnet (dev only)
###############################################################################
resource "aws_security_group" "db_sg" {
  name   = "dev-db-sg"
  vpc_id = module.vpc.vpc_id

  ingress {
    description = "Open Postgres for dev"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "dev-db-sg"
    Environment = "dev"
  }
}

module "db" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.10.0"

  identifier        = "dev-postgres"
  engine            = "postgres"
  engine_version    = "17.2"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "app"
  username = local.db_cred.username
  password = local.db_cred.password
  port     = 5432

  # Dev only
  publicly_accessible    = true
  skip_final_snapshot    = true
  deletion_protection    = false
  create_db_subnet_group = true
  subnet_ids             = module.vpc.public_subnets
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  manage_master_user_password = false
  create_db_parameter_group   = false

  tags = {
    Name        = "dev-postgres"
    Environment = "dev"
  }
}

###############################################################################
# 4. ALB + Security Group (Listening on ports 3000 & 8000)
###############################################################################
resource "aws_security_group" "alb_sg" {
  name   = "dev-alb-sg"
  vpc_id = module.vpc.vpc_id

  # ALB will listen on port 3000 for the frontend
  ingress {
    description = "HTTP for devs"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPs for devs"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "allow inbound traffic on port 8443"
    from_port   = 8443
    to_port     = 8443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all egress"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "dev-alb-sg"
    Environment = "dev"
  }
}

resource "aws_lb" "dev_alb" {
  name               = "dev-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnets

  tags = {
    Name        = "dev-alb"
    Environment = "dev"
  }
}

# FRONTEND TG
resource "aws_lb_target_group" "frontend_tg" {
  name        = "dev-frontend-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path = "/health"
    port = "traffic-port"
  }

  tags = {
    Environment = "dev"
  }
}

# BACKEND TG
resource "aws_lb_target_group" "backend_tg" {
  name        = "dev-backend-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    path = "/health"
    port = "traffic-port"
  }

  tags = {
    Environment = "dev"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.dev_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.dev_alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  # update with actual cert arn
  certificate_arn = "arn:aws:acm:eu-west-2:381492056121:certificate/ac2c6363-762c-4320-8025-dd1337a3a7d8"

  default_action {
    # by default route to frontend
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
}

resource "aws_lb_listener" "backend_8000" {
  load_balancer_arn = aws_lb.dev_alb.arn
  port              = 8443
  protocol          = "HTTPS"
  certificate_arn   = "arn:aws:acm:eu-west-2:381492056121:certificate/ac2c6363-762c-4320-8025-dd1337a3a7d8"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}
###############################################################################
# 5. ECS Cluster
###############################################################################
module "ecs_cluster" {
  source  = "terraform-aws-modules/ecs/aws//modules/cluster"
  version = "5.12.0"

  cluster_name = "dev-ecs-cluster"

  # Fargate capacity providers
  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        weight = 100
      }
    }
  }

  tags = {
    Environment = "dev"
  }
}

###############################################################################
# 6. ECS Task Execution Role
###############################################################################
resource "aws_iam_role" "ecs_task_execution" {
  name               = "devEcsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_policy.json
}

data "aws_iam_policy_document" "ecs_task_execution_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_attach" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

###############################################################################
# 7. ECS Service Security Group
###############################################################################
resource "aws_security_group" "ecs_tasks_sg" {
  name   = "dev-ecs-tasks-sg"
  vpc_id = module.vpc.vpc_id

  egress {
    description = "Allow all egress for dev"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # In dev, no real restrictions
  tags = {
    Name        = "dev-ecs-tasks-sg"
    Environment = "dev"
  }
}

###############################################################################
# 8. ECS Service - No TLS, Cookie Dev Setup
###############################################################################
# Let's define a simple "frontend" + "backend" container for dev
resource "aws_cloudwatch_log_group" "log_group" {
  name              = "/ecs/dev-legion-app"
  retention_in_days = 7
}
module "ecs_service" {
  source  = "terraform-aws-modules/ecs/aws//modules/service"
  version = "5.12.0"

  cluster_arn      = module.ecs_cluster.arn
  name             = "dev-web-app-service"
  launch_type      = "FARGATE"
  platform_version = "LATEST"

  # We want tasks to have Internet to pull images from public ECR
  assign_public_ip = true

  container_definitions = {
    "frontend" = {
      create    = true
      name      = "frontend"
      cpu       = 256
      memory    = 512
      essential = true
      image     = "public.ecr.aws/m8h2m6a1/legion/frontend:latest"
      log_configuration = {
        logDriver = "awslogs"
        options = {
          "awslogs-region"        = "eu-west-2"
          "awslogs-group"         = "/ecs/dev-legion-app"
          "awslogs-stream-prefix" = "ecs"
        }
      }
      port_mappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
    },
    "backend" = {
      create    = true
      name      = "backend"
      cpu       = 256
      memory    = 512
      essential = true
      image     = "public.ecr.aws/m8h2m6a1/legion/backend:latest"
      log_configuration = {
        logDriver = "awslogs"
        options = {
          "awslogs-region"        = "eu-west-2"
          "awslogs-group"         = "/ecs/dev-legion-app"
          "awslogs-stream-prefix" = "ecs"
        }
      }
      port_mappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "ENVIRONMENT", value = "production" },
        { name = "PROJECT_NAME", value = "Legion App" },
        { name = "BACKEND_CORS_ORIGINS", value = "https://test.legiongrappling.com, https://test.legiongrappling.com:8443" },
        { name = "FRONTEND_HOST", value = "https://test.legiongrappling.com" },
        { name = "FIRST_SUPERUSER_FIRSTNAME", value = "Admin" },
        { name = "FIRST_SUPERUSER_LASTNAME", value = "User" },
        { name = "FIRST_SUPERUSER", value = "admin@example.com" },
        { name = "FIRST_SUPERUSER_PASSWORD", value = "admin123" },
        { name = "SECRET_KEY", value = "your-secret-key-here" },
        { name = "SMTP_HOST", value = "smtp.gmail.com" },
        { name = "SMTP_USER", value = "safwaan@legiongrappling.com" },
        { name = "SMTP_PORT", value = "465" },
        { name = "SMTP_SSL", value = "True" },
        { name = "SMTP_TLS", value = "False" },
        { name = "EMAILS_FROM_EMAIL", value = "hello@legiongrappling.com" },

        # RDS references
        {
          name  = "POSTGRES_SERVER"
          value = replace(module.db.db_instance_endpoint, ":5432", "")
        },
        {
          name  = "POSTGRES_PORT"
          value = tostring(module.db.db_instance_port)
        },
        {
          name  = "POSTGRES_DB"
          value = module.db.db_instance_name
        },
        {
          name  = "POSTGRES_USER"
          value = local.db_cred.username
        },
        {
          name  = "POSTGRES_PASSWORD"
          value = local.db_cred.password
        },
        {
          name  = "SMTP_PASSWORD"
          value = local.db_cred.smtpPassword
        }
      ]
    }
  }

  subnet_ids = module.vpc.public_subnets

  # Minimal SG rules
  security_group_rules = {
    allow_http_frontend_in = {
      type        = "ingress"
      from_port   = 3000
      to_port     = 3000
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
    allow_http_backend_in = {
      type        = "ingress"
      from_port   = 8000
      to_port     = 8000
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
    egress_all = {
      type        = "egress"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  load_balancer = {
    frontend_lb = {
      container_name   = "frontend"
      container_port   = 3000
      target_group_arn = aws_lb_target_group.frontend_tg.arn
    }
    backend_lb = {
      container_name   = "backend"
      container_port   = 8000
      target_group_arn = aws_lb_target_group.backend_tg.arn
    }
  }

  tags = {
    Environment = "dev"
  }
}



###############################################################################
# 11. CloudWatch Logs + Example ECS Task Definition for uj
###############################################################################
resource "aws_cloudwatch_log_group" "migrations" {
  name              = "/ecs/migrations-dev"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "migrations" {
  family                   = "myapp-migrations-dev"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512
  network_mode             = "awsvpc"
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name      = "migrations-dev"
      image     = "public.ecr.aws/m8h2m6a1/legion/backend:latest"
      essential = true

      command = [
        "/bin/sh",
        "-c",
        "/bin/bash /app/scripts/prestart.sh && echo 'Migrations done'"
      ]

      environment = [
        { name = "PROJECT_NAME", value = "legion app" },
        { name = "ENVIRONMENT", value = "local" },
        { name = "BACKEND_CORS_ORIGINS", value = "http://app.legion-applications.com, https://app.legion-applications.com" },
        { name = "FIRST_SUPERUSER_FIRSTNAME", value = "Admin" },
        { name = "FIRST_SUPERUSER_LASTNAME", value = "User" },
        { name = "FIRST_SUPERUSER", value = "admin@example.com" },
        { name = "FIRST_SUPERUSER_PASSWORD", value = "admin123" },
        { name = "SECRET_KEY", value = "your-secret-key-here" },
        { name = "SMTP_HOST", value = "email-smtp.eu-west-2.amazonaws.com" },
        { name = "SMTP_USER", value = "AKIAVRUVS2A43OCJLSPN" },
        { name = "SMTP_PORT", value = "587" },
        { name = "SMTP_SSL", value = "False" },
        { name = "SMTP_TLS", value = "True" },
        { name = "EMAILS_FROM_EMAIL", value = "hello@legion-applications.com" },

        {
          name  = "POSTGRES_SERVER"
          value = replace(module.db.db_instance_endpoint, ":5432", "")
        },
        {
          name  = "POSTGRES_PORT"
          value = tostring(module.db.db_instance_port)
        },
        {
          name  = "POSTGRES_DB"
          value = module.db.db_instance_name
        },
        {
          name  = "POSTGRES_USER"
          value = local.db_cred.username
        },
        {
          name  = "POSTGRES_PASSWORD"
          value = local.db_cred.password
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-region"        = "eu-west-2"
          "awslogs-group"         = "/ecs/migrations-dev"
          "awslogs-stream-prefix" = "ecs-dev"
        }
      }
    }
  ])
}

output "alb_dns_name" {
  description = "DNS name of the dev ALB"
  value       = aws_lb.dev_alb.dns_name
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs_cluster.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = "dev-web-app-service"
}
# resource "aws_ecs_task" "run_migrations_once" {
#   cluster         = module.ecs_cluster.id
#   launch_type     = "FARGATE"
#   task_definition = aws_ecs_task_definition.migrations.arn

#   network_configuration {
#     subnets          = module.vpc.public_subnets
#     security_groups  = [aws_security_group.ecs_tasks_sg.id]
#     assign_public_ip = true
#   }

#   depends_on = [module.db] # wait until the DB is up
#   count      = 0           # set to 1 when you actually want to run
# }
locals {
  env_vars = {
    # --- static ---
    ENVIRONMENT               = "production"
    PROJECT_NAME              = "Legion App"
    BACKEND_CORS_ORIGINS      = "https://test.legiongrappling.com,https://test.legiongrappling.com:8443"
    FRONTEND_HOST             = "https://test.legiongrappling.com"
    FIRST_SUPERUSER_FIRSTNAME = "Admin"
    FIRST_SUPERUSER_LASTNAME  = "User"
    FIRST_SUPERUSER           = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD  = "admin123"
    SECRET_KEY                = "your-secret-key-here"
    SMTP_HOST                 = "smtp.gmail.com"
    SMTP_USER                 = "safwaan@legiongrappling.com"
    SMTP_PORT                 = "465"
    SMTP_SSL                  = "True"
    SMTP_TLS                  = "False"
    EMAILS_FROM_EMAIL         = "hello@legiongrappling.com"

    # --- dynamic (DB) ---
    POSTGRES_SERVER   = replace(module.db.db_instance_endpoint, ":5432", "")
    POSTGRES_PORT     = tostring(module.db.db_instance_port)
    POSTGRES_DB       = module.db.db_instance_name
    POSTGRES_USER     = local.db_cred.username
    POSTGRES_PASSWORD = local.db_cred.password

    # --- other secrets you pulled from Secrets Manager ---
    SMTP_PASSWORD = local.db_cred.smtpPassword
  }
}
output "env_vars" {
  description = "All environment variables for the Legion containers"
  value       = local.env_vars
  sensitive   = true # hides them from the default human-readable plan
}

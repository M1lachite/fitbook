# Region potrzebny w definicji wykresów dashboardu
data "aws_region" "current" {}

# Grupa logów backendu: tu trafiają logi kontenera (sterownik awslogs w deploy.yml).
# Nazwa musi być taka sama jak w deploy.yml.
resource "aws_cloudwatch_log_group" "backend" {
  name              = "${var.project}-backend"
  retention_in_days = 7
}

# Metryki z logów. Zakładany format linii Gunicorna:
#   <adres> "<żądanie>" <kod> <czas w ms>
# np.: 10.0.1.5 "GET /api/classes/ HTTP/1.0" 200 12
locals {
  status_classes = {
    "2xx" = "2*"
    "4xx" = "4*"
    "5xx" = "5*"
  }
}

# Liczba żądań z kodem 2xx / 4xx / 5xx
resource "aws_cloudwatch_log_metric_filter" "requests" {
  for_each = local.status_classes

  name           = "${var.project}-requests-${each.key}"
  log_group_name = aws_cloudwatch_log_group.backend.name
  pattern        = "[ip, request, status=${each.value}, duration]"

  metric_transformation {
    name          = "Requests${each.key}"
    namespace     = "Fitbook"
    value         = "1"
    default_value = "0"
    unit          = "Count"
  }
}

# Czas odpowiedzi API w milisekundach (ostatnie pole linii)
resource "aws_cloudwatch_log_metric_filter" "response_time" {
  name           = "${var.project}-response-time"
  log_group_name = aws_cloudwatch_log_group.backend.name
  pattern        = "[ip, request, status>=100, duration>=0]"

  metric_transformation {
    name      = "ResponseTimeMs"
    namespace = "Fitbook"
    value     = "$duration"
    unit      = "Milliseconds"
  }
}

# Dashboard: żądania, czas odpowiedzi, CPU i RAM serwera aplikacji
resource "aws_cloudwatch_dashboard" "monitoring" {
  dashboard_name = "${var.project}-monitoring"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "Liczba żądań HTTP (2xx / 4xx / 5xx)"
          region = data.aws_region.current.region
          view   = "timeSeries"
          stat   = "Sum"
          period = 60
          metrics = [
            ["Fitbook", "Requests2xx"],
            ["Fitbook", "Requests4xx"],
            ["Fitbook", "Requests5xx"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "Czas odpowiedzi API (ms)"
          region = data.aws_region.current.region
          view   = "timeSeries"
          stat   = "Average"
          period = 60
          metrics = [
            ["Fitbook", "ResponseTimeMs"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "Zużycie procesora CPU (%)"
          region = data.aws_region.current.region
          view   = "timeSeries"
          stat   = "Average"
          period = 60
          yAxis  = { left = { min = 0, max = 100 } }
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", aws_instance.app.id]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "Zużycie pamięci RAM (%)"
          region = data.aws_region.current.region
          view   = "timeSeries"
          stat   = "Average"
          period = 60
          yAxis  = { left = { min = 0, max = 100 } }
          metrics = [
            ["Fitbook", "MemoryUtilization", "InstanceId", aws_instance.app.id]
          ]
        }
      }
    ]
  })
}
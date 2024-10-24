locals {
  resource_stage  = var.stage != "" ? "-${var.stage}" : ""
  resource_env    = "-${var.env}"
  resource_suffix = "${local.resource_env}${local.resource_stage}"

  domain_env    = var.env == "prod" ? "" : "${var.env}."
  domain_stage  = var.stage != "" ? "${var.stage}." : ""
  domain_prefix = "${local.domain_stage}${local.domain_env}"
  domain        = "data.${local.domain_prefix}immich.app"

  monitoring_url   = var.env == "prod" ? "https://cf-workers.monitoring.immich.cloud" : "https://cf-workers.monitoring.dev.immich.cloud"
  monitoring_token = var.vmetrics_api_token
}

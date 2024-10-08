locals {
  resource_stage  = var.stage != "" ? "-${var.stage}" : ""
  resource_env    = "-${var.env}"
  resource_suffix = "${local.resource_env}${local.resource_stage}"

  domain_env    = var.env == "prod" ? "" : "${var.env}."
  domain_stage  = var.stage != "" ? "${var.stage}." : ""
  domain_prefix = "${local.domain_stage}${local.domain_env}"
  domain        = "${local.domain_prefix}data.immich.app"
}

locals {
  domain_env    = var.env == "prod" ? "" : "${var.env}."
  domain_stage  = var.stage != "" ? "${var.stage}." : ""
  domain_prefix = "${local.domain_stage}${local.domain_env}"
  domain        = "${local.domain_prefix}data.immich.app"
}

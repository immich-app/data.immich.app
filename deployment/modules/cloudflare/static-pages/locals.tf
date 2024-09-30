locals {
  is_main = var.prefix_name == "main"
  domain_prefix =  !local.is_main && contains(["branch", "pr"], var.prefix_event_type) ? "${var.prefix_name}.preview." : ""
  domain = "${local.domain_prefix}${var.app_url}"
}

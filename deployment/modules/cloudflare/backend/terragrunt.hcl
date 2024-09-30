terraform {
  source = "."

  extra_arguments custom_vars {
    commands = get_terraform_commands_that_need_vars()
  }
}

include "cloudflare" {
  path = find_in_parent_folders("cloudflare.hcl")
}

include "root" {
  path = find_in_parent_folders("root.hcl")
}

locals {
  dist_dir    = get_env("DIST_DIR")
  vmetrics_api_token = get_env("VMETRICS_API_TOKEN")
  env                = get_env("ENVIRONMENT")
}

inputs = {
  dist_dir    = local.dist_dir
  vmetrics_api_token = local.vmetrics_api_token
  env                = local.env
}

remote_state {
  backend = "pg"

  config = {
    conn_str    = get_env("TF_STATE_POSTGRES_CONN_STR")
    schema_name = "${local.env}_cloudflare_data_worker"
  }
}

terraform {
  source = "."

  extra_arguments custom_vars {
    commands = get_terraform_commands_that_need_vars()
  }

  include_in_copy = ["repo-files/*"]
}

include "root" {
  path = find_in_parent_folders("root.hcl")
}

dependencies {
  paths = ["../cloudflare/backend", "../cloudflare/frontend"]
}

locals {
  env = get_env("ENVIRONMENT")
  stage = get_env("STAGE", "")
}

inputs = {
  env = local.env
  stage = local.stage
}

remote_state {
  backend = "pg"

  config = {
    conn_str = get_env("TF_STATE_POSTGRES_CONN_STR")
    schema_name = "data_immich_app_github_org_${local.env}${local.stage}"
  }
}

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
  env = get_env("ENVIRONMENT")
  stage = get_env("STAGE", "")
}

inputs = {
  env = local.env
  stage = local.stage
}

dependencies {
  paths = ["../backend"]
}

remote_state {
  backend = "pg"

  config = {
    conn_str = get_env("TF_STATE_POSTGRES_CONN_STR")
    schema_name = "data_immich_app_cloudflare_frontend_${local.env}${local.stage}"
  }
}

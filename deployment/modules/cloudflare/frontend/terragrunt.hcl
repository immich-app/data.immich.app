terraform {
  source = "."

  extra_arguments custom_vars {
    commands = get_terraform_commands_that_need_vars()
  }
}

include "root" {
  path = find_in_parent_folders("root.hcl")
}

locals {
  env = get_env("TF_VAR_env")
  stage = get_env("TF_VAR_stage", "")
}

dependencies {
  paths = ["../backend"]
}

remote_state {
  backend = "pg"

  config = {
    conn_str = get_env("TF_VAR_tf_state_postgres_conn_str")
    schema_name = "data_immich_app_cloudflare_frontend_${local.env}${local.stage}"
  }
}

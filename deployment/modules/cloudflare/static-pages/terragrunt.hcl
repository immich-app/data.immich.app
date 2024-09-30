terraform {
  source = "."

  extra_arguments custom_vars {
    commands = get_terraform_commands_that_need_vars()
  }
}

include {
  path = find_in_parent_folders("state.hcl")
}

locals {
  prefix_name = get_env("TF_VAR_prefix_name")
  app_name = replace(get_env("TF_VAR_app_name"), "-", "_")
}

remote_state {
  backend = "pg"

  config = {
    conn_str = get_env("TF_STATE_POSTGRES_CONN_STR")
    schema_name = "prod_cloudflare_immich_app_${local.app_name}_${local.prefix_name}"
  }
}

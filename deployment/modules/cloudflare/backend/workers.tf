data "cloudflare_zone" "immich_cloud" {
  name = "immich.cloud"
}

resource "cloudflare_workers_script" "data_api" {
  account_id = var.cloudflare_account_id
  name       = "data-api-${var.env}"
  content    = file("${var.dist_dir}/backend/index.js")
  module     = true

  plain_text_binding {
    name = "ENVIRONMENT"
    text = var.env
  }

  secret_text_binding {
    name = "VMETRICS_API_TOKEN"
    text = var.vmetrics_api_token
  }

  compatibility_date  = "2024-07-29"
  compatibility_flags = ["nodejs_compat"]
}

data "http" "data_api_deployments" {
  depends_on = [cloudflare_workers_script.data_api]
  url        = "https://api.cloudflare.com/client/v4/accounts/${var.cloudflare_account_id}/workers/scripts/${cloudflare_workers_script.data_api.name}/deployments"
  request_headers = {
    Authorization = "Bearer ${data.terraform_remote_state.api_keys_state.outputs.terraform_key_cloudflare_account}"
  }
}

locals {
  data_api_version_id = split("-", jsondecode(data.http.data_api_deployments.response_body).result.deployments[0].versions[0].version_id)[0]
}

output "data_api_preview_url" {
  value = "https://${local.data_api_version_id}-${cloudflare_workers_script.data_api.name}.immich.workers.dev"
}

resource "cloudflare_workers_route" "data_api_prod" {
  count      = var.env == "prod" ? 1 : 0
  pattern    = "data.immich.app/api*"
  script_name = cloudflare_workers_script.data_api.name
  zone_id    = data.cloudflare_zone.immich_cloud.zone_id
}

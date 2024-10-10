data "cloudflare_zone" "immich_app" {
  name = "immich.app"
}

resource "cloudflare_workers_script" "data_api" {
  account_id = var.cloudflare_account_id
  name       = "data-api${local.resource_suffix}"
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

resource "random_password" "data_ingest_api_slug" {
  length  = 16
  special = false
}

resource "cloudflare_workers_script" "data_ingest_api" {
  account_id = var.cloudflare_account_id
  name       = "data-ingest-api${local.resource_suffix}"
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

  secret_text_binding {
    name = "SLUG"
    text = random_password.data_ingest_api_slug.result
  }

  queue_binding {
    binding = "DATA_QUEUE"
    queue   = cloudflare_queue.data_ingest.name
  }

  compatibility_date  = "2024-07-29"
  compatibility_flags = ["nodejs_compat"]
}

resource "cloudflare_workers_script" "data_ingest_processor" {
  account_id = var.cloudflare_account_id
  name       = "data-ingest-processor${local.resource_suffix}"
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

locals {
  data_api_url   = "${local.domain}/api"
  ingest_api_url = "${local.domain}/ingest"
}

output "data_api_url" {
  value = "https://${local.data_api_url}"
}

output "ingest_api_url" {
  value = "https://${local.ingest_api_url}"
}

output "ingest_api_slug" {
  value     = random_password.data_ingest_api_slug.result
  sensitive = true
}

resource "cloudflare_workers_route" "data_api_root" {
  pattern     = local.data_api_url
  script_name = cloudflare_workers_script.data_api.name
  zone_id     = data.cloudflare_zone.immich_app.zone_id
}

resource "cloudflare_workers_route" "ingest_api_root" {
  pattern     = local.ingest_api_url
  script_name = cloudflare_workers_script.data_ingest_api.name
  zone_id     = data.cloudflare_zone.immich_app.zone_id
}

resource "cloudflare_workers_route" "data_api_wildcard" {
  pattern     = "${local.data_api_url}/*"
  script_name = cloudflare_workers_script.data_api.name
  zone_id     = data.cloudflare_zone.immich_app.zone_id
}

resource "cloudflare_workers_route" "ingest_api_wildcard" {
  pattern     = "${local.ingest_api_url}/*"
  script_name = cloudflare_workers_script.data_ingest_api.name
  zone_id     = data.cloudflare_zone.immich_app.zone_id
}

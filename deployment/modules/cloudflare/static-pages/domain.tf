resource "cloudflare_pages_domain" "immich_app_branch_domain" {
  account_id   = var.cloudflare_account_id
  project_name = data.terraform_remote_state.cloudflare_account.outputs.static_pages_project_names[var.app_url]
  domain       = local.domain
}

resource "cloudflare_record" "immich_app_branch_subdomain" {
  name    = local.domain
  proxied = true
  ttl     = 1
  type    = "CNAME"
  value   = local.is_main ? data.terraform_remote_state.cloudflare_account.outputs.static_pages_project_subdomains[var.app_url] : "${replace(var.prefix_name, "/\\/|\\./", "-")}.${data.terraform_remote_state.cloudflare_account.outputs.static_pages_project_subdomains[var.app_url]}"
  zone_id = data.terraform_remote_state.cloudflare_account.outputs.immich_app_zone_id
}

output "immich_app_branch_subdomain" {
  value = cloudflare_record.immich_app_branch_subdomain.hostname
}

output "immich_app_branch_pages_hostname" {
  value = cloudflare_record.immich_app_branch_subdomain.value
}

output "pages_project_name" {
  value = cloudflare_pages_domain.immich_app_branch_domain.project_name
}

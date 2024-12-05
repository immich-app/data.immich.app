provider "github" {
  app_auth {
    id              = var.github_app_tofu_id
    installation_id = var.github_app_tofu_installation_id
    pem_file        = var.github_app_tofu_pem_file
  }
  owner = var.github_app_tofu_owner
}

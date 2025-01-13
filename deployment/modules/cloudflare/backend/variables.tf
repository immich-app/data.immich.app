variable "cloudflare_account_id" {}
variable "tf_state_postgres_conn_str" {}
variable "dist_dir" {}
variable "vmetrics_data_write_token" {}
variable "vmetrics_data_read_token" {}
variable "env" {}
variable "stage" {
  default = ""
}
variable "github_app_read_only_id" {}
variable "github_app_read_only_installation_id" {}
variable "github_app_read_only_pem_file_pkcs8" {}

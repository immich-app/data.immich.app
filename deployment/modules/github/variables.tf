variable "tf_state_postgres_conn_str" {}

variable "github_app_tofu_id" {}
variable "github_app_tofu_installation_id" {}
variable "github_app_tofu_pem_file" {}
variable "github_app_tofu_owner" {}

variable "env" {}
variable "stage" {
  default = ""
}

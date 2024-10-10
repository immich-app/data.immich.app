resource "github_organization_webhook" "bot" {
  events = [
    "star",
    "discussion",
    "issues",
    "pull_request",
  ]
  configuration {
    url          = "${data.terraform_remote_state.backend.outputs.ingest_api_url}/github/${data.terraform_remote_state.backend.outputs.ingest_api_slug}"
    content_type = "json"
  }
}

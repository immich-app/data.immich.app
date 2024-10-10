terraform {
  backend "pg" {}
  required_version = "~> 1.7"

  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

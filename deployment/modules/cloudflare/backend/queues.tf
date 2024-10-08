resource "cloudflare_queue" "data_ingest" {
  account_id = var.cloudflare_account_id
  name       = "data-ingest${local.resource_suffix}"

  provisioner "local-exec" {
    on_failure = fail
    when       = create
    command    = <<EOT
      curl --fail-with-body -S -X POST https://api.cloudflare.com/client/v4/accounts/${var.cloudflare_account_id}/queues/${self.id}/consumers \
      -H 'Authorization: Bearer ${data.terraform_remote_state.api_keys_state.outputs.terraform_key_cloudflare_account}' \
      -d '{
        "script_name": "${cloudflare_workers_script.data_ingest_processor.name}",
        "environment": "production",
        "queue_name": "${cloudflare_queue.data_ingest.name}}",
        "dead_letter_queue": "${cloudflare_queue.data_ingest_dlq.name}",
        "type": "worker",
        "settings": {
          "max_retries": 3,
          "max_wait_time_ms": 5000,
          "batch_size": 10,
          "max_concurrency": null,
          "retry_delay": 0
        }
      }'
    EOT
  }
}

resource "cloudflare_queue" "data_ingest_dlq" {
  account_id = var.cloudflare_account_id
  name       = "data-ingest${local.resource_suffix}-dlq"
}



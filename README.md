```json
{
  "mcpServers": {
    "slack": {
      "command": "docker",
      "args": [
        "run",
        "--platform=linux/amd64",
        "-i",
        "--rm",
        "-e",
        "NOTIONAL_ID",
        "-e",
        "ACCOUNT_PASS",
        "-e",
        "CERT_PATH",
        "-e",
        "CERT_PASS",
        "-e",
        "ENABLE_ORDER",
        "--mount", "type=bind,src=/path/to/cert.p12,dst=/app/cert.p12",
        "kevinypfan/fugle-mcp-server"
      ],
      "env": {
        "NOTIONAL_ID": "<身分證字號>",
        "ACCOUNT_PASS": "<帳戶密碼>",
        "CERT_PATH": "/app/cert.p12",
        "CERT_PASS": "<憑證密碼>",
        "ENABLE_ORDER": "<開啟下單功能 ex: true or false>"
      }
    }
  }
}

```

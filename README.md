```json
{
  "mcpServers": {
    "fugle-mcp-server": {
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
        "CERT_PASS",
        "-e",
        "ENABLE_ORDER",
        "--mount", "type=bind,src=</path/to/cert.p12>,dst=/app/cert.p12",
        "kevinypfan/fugle-mcp-server"
      ],
      "env": {
        "NOTIONAL_ID": "<身分證字號>",
        "ACCOUNT_PASS": "<帳戶密碼>",
        "CERT_PASS": "<憑證密碼>",
        "ENABLE_ORDER": "<開啟下單功能 ex: true or false>"
      }
    }
  }
}
```

```json
{
  "mcpServers": {
    "fugle-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "fugle-mcp-server"
      ],
      "env": {
        "NOTIONAL_ID": "<身分證字號>",
        "ACCOUNT_PASS": "<帳戶密碼>",
        "CERT_PASS": "<憑證密碼>",
        "CERT_PATH": "<憑證位置>",
        "ENABLE_ORDER": "<開啟下單功能 ex: true or false>"
      }
    }
  }
}
```
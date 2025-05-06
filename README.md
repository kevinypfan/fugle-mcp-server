# Fugle MCP Server

![Docker Pulls](https://img.shields.io/docker/pulls/kevinypfan/fugle-mcp-server)
![Docker Image Size](https://img.shields.io/docker/image-size/kevinypfan/fugle-mcp-server)
![NPM Version](https://img.shields.io/npm/v/fugle-mcp-server)
![NPM Downloads](https://img.shields.io/npm/dm/fugle-mcp-server)
<!-- ![License](https://img.shields.io/npm/l/fugle-mcp-server) -->

富果 MCP (Model Context Protocol) 伺服器，用於與富果交易系統進行互動。此伺服器支援股票行情查詢和交易功能。

## 功能特點

- 支援股票即時行情查詢
- 支援歷史數據查詢
- 支援交易功能（可選）
- 支援 Docker 和 NPM 兩種部署方式
- 完全兼容 MCP 協議

## 安裝

### 使用 NPM

```bash
npx fugle-mcp-server
```

### 使用 Docker

```bash
docker pull kevinypfan/fugle-mcp-server
```

## 使用方法

### 環境變數

伺服器需要以下環境變數：

- `SDK_TYPE`: MCP Server 使用 SDK 類型（可選：「元富(masterlink)」或「富邦(fubon)」，預設為「元富(masterlink)」）
- `NATIONAL_ID`: 身分證字號
- `ACCOUNT_PASS`: 帳戶密碼
- `CERT_PASS`: 憑證密碼
- `CERT_PATH`: 憑證檔案路徑
- `ENABLE_ORDER`: 是否開啟下單功能（可選，預設為 false）
- `ACCOUNT`: 如有多帳戶，可以使用此參數指定登入帳戶（可選，預設為第一個帳戶）

### Docker 配置

在您的 `.mcp-config.json` 中添加：

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
        "SDK_TYPE",
        "-e",
        "NATIONAL_ID",
        "-e",
        "ACCOUNT_PASS",
        "-e",
        "CERT_PASS",
        "-e",
        "ENABLE_ORDER",
        "-e",
        "ACCOUNT",
        "--mount", "type=bind,src=</path/to/cert.p12>,dst=/app/cert.p12",
        "kevinypfan/fugle-mcp-server"
      ],
      "env": {
        "SDK_TYPE": "masterlink|fubon",
        "NATIONAL_ID": "您的身分證字號",
        "ACCOUNT_PASS": "您的帳戶密碼",
        "CERT_PASS": "您的憑證密碼",
        "ENABLE_ORDER": "false",
        "ACCOUNT": "指定使用帳戶號碼"
      }
    }
  }
}
```

### NPM 配置

在您的 `.mcp-config.json` 中添加：

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
        "SDK_TYPE": "masterlink|fubon",
        "NATIONAL_ID": "您的身分證字號",
        "ACCOUNT_PASS": "您的帳戶密碼",
        "CERT_PASS": "您的憑證密碼",
        "CERT_PATH": "/path/to/your/cert.p12",
        "ENABLE_ORDER": "false",
        "ACCOUNT": "指定使用帳戶號碼"
      }
    }
  }
}
```


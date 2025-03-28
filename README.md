# Fugle MCP Server

![Docker Pulls](https://img.shields.io/docker/pulls/kevinypfan/fugle-mcp-server)
![Docker Image Size](https://img.shields.io/docker/image-size/kevinypfan/fugle-mcp-server)
![NPM Version](https://img.shields.io/npm/v/fugle-mcp-server)
![NPM Downloads](https://img.shields.io/npm/dm/fugle-mcp-server)
<!-- ![License](https://img.shields.io/npm/l/fugle-mcp-server) -->

富果 MCP (Model Context Protocol) 服務器，用於與富果交易系統進行互動。此服務器支持股票行情查詢和交易功能。

## 功能特點

- 支持股票即時行情查詢
- 支持歷史數據查詢
- 支持交易功能（可選）
- 支持 Docker 和 NPM 兩種部署方式
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

### 環境變量

服務器需要以下環境變量：

- `NATIONAL_ID`: 身分證字號
- `NOTIONAL_ID`: 身分證字號（已棄用，請改用 NATIONAL_ID）
- `ACCOUNT_PASS`: 帳戶密碼
- `CERT_PASS`: 憑證密碼
- `CERT_PATH`: 憑證位置（僅 NPM 方式需要）
- `ENABLE_ORDER`: 是否開啟下單功能（可選，預設為 false）

> **重要通知**: 
> - 從版本 0.0.7 開始，我們將 `NOTIONAL_ID` 更名為 `NATIONAL_ID`。為了保持向後兼容性，兩個環境變量目前都可以使用，但建議使用 `NATIONAL_ID`。
> - **棄用計劃**: `NOTIONAL_ID` 將在版本 0.1.0 中被完全移除。請在此之前遷移到 `NATIONAL_ID`。

### Docker 配置

在你的 `.mcp-config.json` 中添加：

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
        "NATIONAL_ID",
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
        "NATIONAL_ID": "<身分證字號>",
        "ACCOUNT_PASS": "<帳戶密碼>",
        "CERT_PASS": "<憑證密碼>",
        "ENABLE_ORDER": "<開啟下單功能 ex: true or false>"
      }
    }
  }
}
```

### NPM 配置

在你的 `.mcp-config.json` 中添加：

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
        "NATIONAL_ID": "<身分證字號>",
        "ACCOUNT_PASS": "<帳戶密碼>",
        "CERT_PASS": "<憑證密碼>",
        "CERT_PATH": "<憑證位置>",
        "ENABLE_ORDER": "<開啟下單功能 ex: true or false>"
      }
    }
  }
}
```

## 命令行選項

- `-v, --version`: 顯示版本號

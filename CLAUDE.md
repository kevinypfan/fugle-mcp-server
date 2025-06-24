# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Fugle MCP (Model Context Protocol) Server for Taiwan stock market operations. The server supports two different trading platforms:
- **Masterlink SDK** (default)
- **Fubon Neo SDK**

The server provides stock market data, trading functionality, and fundamental analysis tools through MCP protocol.

## Architecture

The codebase follows a modular architecture with SDK abstraction:

- `src/index.ts` - Main server entry point with environment validation
- `src/config.ts` - Configuration management for SDK selection
- `src/shared/` - Common utilities and abstractions:
  - `factory/` - SDK abstraction layer with unified interfaces
  - `marketdata/` - Market data tools (intraday, historical, snapshots)
  - `fundamental/` - Company analysis tools via Fugle API
- `src/masterlink/` - Masterlink SDK specific implementations
- `src/fubon/` - Fubon SDK specific implementations

Each SDK implementation provides:
- `account/` - Account management tools
- `trade/` - Trading operations
- Shared market data tools through the factory pattern

## Development Commands

```bash
# Build the project
npm run build

# Watch mode for development
npm run watch

# Test with MCP inspector
npm run inspector

# Run the server directly
node build/index.js
```

## SDK Configuration

The server uses `SDK_TYPE` environment variable to switch between trading platforms:
- `masterlink` (default) - Uses Masterlink SDK
- `fubon` - Uses Fubon Neo SDK

Both SDKs are abstracted through the factory pattern in `src/shared/factory/` to provide unified interfaces for market data operations.

## Required Environment Variables

- `NATIONAL_ID` - Taiwan National ID
- `ACCOUNT_PASS` - Trading account password  
- `CERT_PASS` - Certificate password
- `CERT_PATH` - Path to certificate file (defaults to `/app/cert.p12`)
- `SDK_TYPE` - SDK selection (`masterlink` or `fubon`)
- `ENABLE_ORDER` - Enable trading functionality (default: false)
- `ACCOUNT` - Specific account selection for multi-account users

## Local File Dependencies

The project includes bundled SDK packages:
- `fubon-neo-2.2.2.tgz`
- `masterlink-sdk-1.0.0.tgz`

These are installed as file dependencies and bundled with the NPM package.
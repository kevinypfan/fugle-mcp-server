import { version } from "../package.json";

export const config = {
  fugle: {
    apiUrl: process.env.FUGLE_API_URL || 'https://www.fugle.tw/api/v2',
  },
  // MCP server specific configuration
  mcp: {
    name: 'fugle-mcp-server',
    version,
    description: 'Fugle API MCP server for Taiwan stock market information and trades'
  }
};

export default config;
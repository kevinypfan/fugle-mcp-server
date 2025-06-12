import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FugleApiProvider } from "../providers";
import { loadToolMetadata, createToolHandler } from "../../utils/index.js";
import path from "path";

/**
 * 註冊股票搜尋自動完成工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {FugleApiProvider} provider 股票 Fugle API 客戶端
 */
export function registerAutocompleteTool(
  server: McpServer,
  provider: FugleApiProvider
) {
  const currentDir = path.join(__dirname, '..');
  const { description } = loadToolMetadata(currentDir, 'get-autocomplete-terms', '根據部分輸入獲取股票搜尋自動完成結果');
  
  server.tool(
    "get_autocomplete_terms",
    description,
    {
      terms: z.string().describe("搜尋關鍵字"),
    },
    createToolHandler(
      currentDir,
      'get-autocomplete-terms',
      async ({ terms }) => {
        const data = await provider.getAutocompleteTerms(terms);
        return { data };
      },
      {
        errorMessage: "查詢時發生錯誤",
      }
    )
  );
}

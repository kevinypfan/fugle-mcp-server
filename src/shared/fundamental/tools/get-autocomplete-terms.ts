import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FugleApiProvider } from "../providers";

/**
 * 註冊股票搜尋自動完成工具到 MCP Server
 * @param {McpServer} server MCP Server 實例
 * @param {FugleApiProvider} provider 股票 Fugle API 客戶端
 */
export function registerAutocompleteTool(
  server: McpServer,
  provider: FugleApiProvider
) {
  // 取得股票搜尋自動完成工具
  server.tool(
    "get_autocomplete_terms",
    "根據部分輸入獲取股票搜尋自動完成結果",
    {
      terms: z.string().describe("搜尋關鍵字"),
    },
    async ({ terms }) => {
      try {
        const data = await provider.getAutocompleteTerms(terms);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ data }),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

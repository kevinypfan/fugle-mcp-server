import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import marginQuotaReference from "./references/margin-quota.json";

/**
 * 註冊查詢資券配額相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerMarginQuotaTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢資券配額工具
  server.tool(
    "get_marginQuota",
    "查詢股票資券配額",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330"),
      queryType: z
        .enum(["1", "2", "all"])
        .describe("查詢類別：1-融資、2-融券、all-全部")
        .default("all"),
    },
    async ({ symbol, queryType }, extra) => {
      try {
        let resultData: any[] = [];
        
        // 根據查詢類別獲取資料
        if (queryType === "all") {
          // 如果是全部，則分別查詢融資和融券
          const marginData = await sdk.stock.marginQuota(accounts[0], symbol, "1");
          const shortData = await sdk.stock.marginQuota(accounts[0], symbol, "2");
          
          if (marginData) resultData.push(marginData);
          if (shortData) resultData.push(shortData);
        } else {
          // 否則只查詢指定類別
          const data = await sdk.stock.marginQuota(accounts[0], symbol, queryType);
          if (data) resultData.push(data);
        }

        const response = `API Response\n\`\`\`json\n${JSON.stringify(resultData, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(marginQuotaReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢資券配額時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
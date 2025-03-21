import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

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

        // 檢查是否有查詢結果
        if (resultData.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `❌ 查無 ${symbol} 的資券配額資訊`,
              },
            ],
          };
        }

        // 構建回應文本
        let responseText = `📊 **${symbol} 資券配額查詢結果**\n\n`;

        // 遍歷結果資料
        resultData.forEach((data) => {
          const isMargin = data.kind === "1";
          const title = isMargin ? "**融資資訊**" : "**融券資訊**";
          
          responseText += `${title}\n`;
          
          // 資券限額
          responseText += `- 資券限額: ${data.tqty || "未提供"}\n`;
          
          // 是否停止交易
          responseText += `- ${isMargin ? "融資" : "融券"}狀態: ${data.stop === "Y" ? "已停止" : "可交易"}\n`;
          
          // 成數資訊
          if (isMargin) {
            if (data.cr_percentage) {
              const crPercentage = parseFloat(data.cr_percentage) / 1000;
              responseText += `- 融資成數: ${crPercentage.toFixed(1)}\n`;
            }
            if (data.cr_status) {
              responseText += `- 融資狀態: ${data.cr_status}\n`;
            }
          } else {
            if (data.db_percentage) {
              const dbPercentage = parseFloat(data.db_percentage) / 1000;
              responseText += `- 融券成數: ${dbPercentage.toFixed(1)}\n`;
            }
            if (data.db_status) {
              responseText += `- 融券狀態: ${data.db_status}\n`;
            }
          }
          
          // 信用交易資格
          if (data.cr_flag) {
            responseText += `- 信用交易資格: ${data.cr_flag === "N" ? "有" : "無"}\n`;
          }
          
          // 平盤下可券賣
          if (data.lu_msg) {
            responseText += `- ${data.lu_msg}\n`;
          }
          
          // 當沖資訊
          if (data.dte_msg) {
            responseText += `- ${data.dte_msg}\n`;
          }
          
          responseText += "\n";
        });

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `❌ 查詢資券配額失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * 解析融資融券成數
 * @param percentage 成數字串，例如"0600"
 * @returns 格式化後的成數，例如"0.6"
 */
function parsePercentage(percentage: string): string {
  if (!percentage || percentage.length !== 4) {
    return "未知";
  }
  
  const value = parseInt(percentage);
  return (value / 1000).toFixed(1);
}
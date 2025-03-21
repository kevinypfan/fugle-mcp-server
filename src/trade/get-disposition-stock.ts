import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊查詢處置股票相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerDispositionStockTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 查詢處置股票工具
  server.tool(
    "query_disposition_stock",
    "查詢處置股票",
    {
      symbol: z
        .string()
        .describe("股票代號，例如：2330（可選，不填則查詢所有處置股票）"),
    },
    async ({ symbol }, extra) => {
      try {
        // 呼叫 SDK 獲取處置股票資訊
        const stockStatusData = await sdk.stock.queryDispositionStock(
          accounts[0],
          symbol
        );

        // 檢查是否有查詢結果
        if (!stockStatusData) {
          return {
            content: [
              {
                type: "text",
                text: symbol
                  ? `📢 查無 ${symbol} 的處置股票資訊`
                  : "📢 目前沒有處置股票",
              },
            ],
          };
        }

        // 構建回應文本
        let responseText = "";

        // 處理單一股票查詢結果
        if (!Array.isArray(stockStatusData) || symbol) {
          const stockData = Array.isArray(stockStatusData)
            ? stockStatusData[0]
            : stockStatusData;

          responseText = `⚠️ **${stockData.symbol} 處置股票資訊**\n\n`;

          // 處置股票狀態
          responseText += `**處置狀態：** ${getDispositionStatusText(
            stockData.dispositionStockMark || "?"
          )}\n`;

          // 處置說明
          if (stockData.dispositionDescription) {
            responseText += `**處置說明：** ${stockData.dispositionDescription}\n`;
          }

          // 異常推介註記
          if (stockData.abnormalRecommendationMark === "1") {
            responseText += `**異常推介：** ${
              stockData.abnormalDescription || "投資理財節目異常推介"
            }\n`;
          }

          // 特殊異常註記
          if (stockData.specialAbnormalMark === "1") {
            responseText += `**特殊異常：** ${
              stockData.specialAbnormalDescription || "特殊異常有價證券"
            }\n`;
          }

          // 內控類別
          if (stockData.internalControlCategory !== "0") {
            responseText += `**內控類別：** ${getInternalControlText(
              stockData.internalControlCategory || "?"
            )}\n`;
            if (stockData.internalControlDescription) {
              responseText += `**內控說明：** ${stockData.internalControlDescription}\n`;
            }
          }

          // 風險提示
          responseText += `\n**⚠️ 注意事項：** 處置股票交易有特殊限制，請注意交易風險！`;
        }
        // 處理所有處置股票列表
        else {
          responseText = `⚠️ **處置股票列表**\n\n`;

          // 計算處置股票數量
          const dispositionStocks = stockStatusData.filter(
            (stock) =>
              stock.dispositionStockMark === "1" ||
              stock.dispositionStockMark === "2" ||
              stock.dispositionStockMark === "3"
          );

          responseText += `目前共有 ${dispositionStocks.length} 檔處置股票：\n\n`;

          // 分類處置股票
          const normalDispositionStocks = dispositionStocks.filter(
            (stock) => stock.dispositionStockMark === "1"
          );
          const secondDispositionStocks = dispositionStocks.filter(
            (stock) => stock.dispositionStockMark === "2"
          );
          const flexibleDispositionStocks = dispositionStocks.filter(
            (stock) => stock.dispositionStockMark === "3"
          );

          // 顯示處置股票
          if (normalDispositionStocks.length > 0) {
            responseText += `**處置股票：**\n`;
            normalDispositionStocks.forEach((stock) => {
              responseText += `- ${stock.symbol}：${
                stock.dispositionDescription || "處置有價證券，請注意交易風險！"
              }\n`;
            });
            responseText += `\n`;
          }

          // 顯示再次處置股票
          if (secondDispositionStocks.length > 0) {
            responseText += `**再次處置股票：**\n`;
            secondDispositionStocks.forEach((stock) => {
              responseText += `- ${stock.symbol}：${
                stock.dispositionDescription ||
                "再次處置有價證券，請注意交易風險！"
              }\n`;
            });
            responseText += `\n`;
          }

          // 顯示彈性處置股票
          if (flexibleDispositionStocks.length > 0) {
            responseText += `**彈性處置股票：**\n`;
            flexibleDispositionStocks.forEach((stock) => {
              responseText += `- ${stock.symbol}：${
                stock.dispositionDescription ||
                "彈性處置有價證券，請注意交易風險！"
              }\n`;
            });
          }

          // 查詢提示
          responseText += `\n您可以輸入特定股票代號查詢詳細處置資訊，例如：查詢處置股票 2330`;
        }

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `❌ 查詢處置股票失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * 獲取處置狀態的文字說明
 * @param mark 處置狀態碼
 * @returns 處置狀態的文字說明
 */
function getDispositionStatusText(mark: string): string {
  switch (mark) {
    case "1":
      return "處置股票";
    case "2":
      return "再次處置";
    case "3":
      return "彈性處置";
    case "0":
    default:
      return "正常";
  }
}

/**
 * 獲取內控類別的文字說明
 * @param category 內控類別代碼
 * @returns 內控類別的文字說明
 */
function getInternalControlText(category: string): string {
  switch (category) {
    case "AA":
      return "委託超過 30 萬需預收";
    case "A":
      return "委託超過 50 萬需預收";
    case "B":
      return "委託超過 300 萬需預收";
    case "C":
      return "委託超過 500 萬需預收";
    case "0":
    default:
      return "正常";
  }
}

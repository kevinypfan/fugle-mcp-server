import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, BSAction, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";

/**
 * 註冊已實現損益查詢工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerRealizedProfitAndLossesTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 已實現損益查詢工具
  server.tool(
    "get_account_realized_profit_and_losses",
    "查詢指定期間內的已實現損益",
    {
      start_date: z
        .string()
        .describe("查詢起始日期，格式為YYYYMMDD，例如：20240101"),
      end_date: z
        .string()
        .describe("查詢結束日期，格式為YYYYMMDD，例如：20240131"),
    },
    async ({ start_date, end_date }) => {
      try {
        // 檢查日期格式是否正確
        if (!/^\d{8}$/.test(start_date) || !/^\d{8}$/.test(end_date)) {
          return {
            content: [
              {
                type: "text",
                text: "日期格式錯誤！請使用YYYYMMDD格式，例如：20240101",
              },
            ],
            isError: true,
          };
        }

        // 檢查結束日期是否早於起始日期
        if (parseInt(end_date) < parseInt(start_date)) {
          return {
            content: [
              {
                type: "text",
                text: "查詢結束日期不能早於起始日期！",
              },
            ],
            isError: true,
          };
        }

        // 透過SDK獲取已實現損益資訊
        const profitAndLossData = await sdk.accounting.realizedProfitAndLoses(
          account,
          start_date,
          end_date
        );

        // 格式化貨幣金額
        const formatCurrency = (value?: string) => {
          if (!value) return "0";
          const numValue = parseInt(value);
          return numValue.toLocaleString("zh-TW");
        };

        // 格式化日期
        const formatDate = (dateStr?: string) => {
          if (!dateStr || dateStr.length !== 8) return dateStr;
          return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(
            6,
            8
          )}`;
        };

        // 取得沖銷類別名稱
        const getClosedTypeName = (closeType?: string) => {
          if (!closeType) return "未知";
          switch (closeType) {
            case "0":
              return "現股";
            case "1":
              return "融資";
            case "2":
              return "融券";
            case "3":
              return "信用當沖";
            case "4":
              return "現股當沖";
            case "5":
              return "現賣/券差買進";
            default:
              return "其他";
          }
        };

        // 組建摘要
        let summaryText = `
【已實現損益摘要】(${formatDate(start_date)} ~ ${formatDate(end_date)})

總體概況：
- 買入總成本：${formatCurrency(profitAndLossData.cost)} 元
- 賣出總收入：${formatCurrency(profitAndLossData.income)} 元
- 已實現總損益：${formatCurrency(profitAndLossData.profitLoss)} 元 (${
          profitAndLossData.profitLossRate || "0%"
        })
- 累計總損益：${formatCurrency(profitAndLossData.accumulatedProfitLoss)} 元 (${
          profitAndLossData.accumulatedProfitLossRate || "0%"
        })

其他費用：
- 融券手續費：${formatCurrency(profitAndLossData.shortSellingFee)} 元
- 利息：${formatCurrency(profitAndLossData.interest)} 元
- 償還融資金額：${formatCurrency(profitAndLossData.closedMarginAmount)} 元
- 股利金額：${formatCurrency(profitAndLossData.dividendAmount)} 元
- 券差借券費：${formatCurrency(
          profitAndLossData.securitiesLendingDifferentialFee
        )} 元
`;

        // 如果有交易明細，加入交易記錄
        if (
          profitAndLossData.profitLossSummary &&
          profitAndLossData.profitLossSummary.length > 0
        ) {
          summaryText += `\n【交易記錄明細】\n`;

          profitAndLossData.profitLossSummary.forEach((record, index) => {
            const recordDate = formatDate(record.tDate);
            summaryText += `
${index + 1}. ${record.symbolName}（${record.symbol}）- ${recordDate}：
   - 交易類型：${record.orderTypeName} ${getClosedTypeName(record.closedType)}
   - 買賣方向：${
     record.buySell === BSAction.Buy
       ? "買入"
       : record.buySell === BSAction.Sell || record.buySell === "Sell"
       ? "賣出"
       : record.buySell || "未知"
   }
   - 成交數量：${formatCurrency(record.closedQuantity)} 股
   - 成交價格：${record.filledPrice} 元
   - 買入成本：${formatCurrency(record.cost)} 元
   - 賣出收入：${formatCurrency(record.income)} 元
   - 實現損益：${formatCurrency(record.profitLoss)} 元 (${
              record.profitLossRate || "0%"
            })
`;

            // 如果有買賣明細資訊，加入詳細資訊
            if (record.buyDetail || record.sellDetail) {
              summaryText += `   - 交易明細：`;

              if (record.buyDetail) {
                summaryText += `買入 ${
                  record.buyDetail.orderNo || ""
                } (${formatDate(record.buyDetail.tDate)}，${
                  record.buyDetail.filledPrice
                }元) `;
              }

              if (record.sellDetail) {
                summaryText += `賣出 ${
                  record.sellDetail.orderNo || ""
                } (${formatDate(record.sellDetail.tDate)}，${
                  record.sellDetail.filledPrice
                }元)`;
              }

              summaryText += `\n`;
            }
          });
        } else {
          summaryText += "\n查詢期間內無已實現損益記錄。";
        }

        return {
          content: [{ type: "text", text: summaryText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢已實現損益資訊時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

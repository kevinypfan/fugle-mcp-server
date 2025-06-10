import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { 
  Account,
  StopSign,
  TrailOrder
} from "fubon-neo/trade";
import { z } from "zod";

/**
 * Register trail profit order tool to MCP Server
 */
export function registerTrailProfitTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "trail_profit_order",
    "建立追蹤停利委託",
    {
      start_date: z.string().describe("監控開始日期 (YYYYMMDD)"),
      end_date: z.string().describe("監控結束日期 (YYYYMMDD)"),
      stop_sign: z.enum(["Full", "Partial", "UntilEnd"]).describe(
        "停損條件：Full = 全部成交後結束, Partial = 部分成交後結束, UntilEnd = 委託持續到結束日期"
      ),
      
      // Trail order object
      trail_symbol: z.string().describe("追蹤股票代號"),
      trail_price: z.number().describe("基準價格（最多2位小數）"),
      trail_direction: z.enum(["Up", "Down"]).describe(
        "追蹤方向：Up = 向上追蹤, Down = 向下追蹤"
      ),
      trail_percentage: z.number().describe("追蹤百分比閾值"),
      trail_buysell: z.enum(["Buy", "Sell"]).describe("買賣別：Buy = 買, Sell = 賣"),
      trail_quantity: z.number().describe("委託數量"),
      trail_price_type: z.enum(["Limit", "Market", "BidPrice", "AskPrice", "MatchedPrice"]).describe(
        "執行價格類型：Limit = 限價, Market = 市價, BidPrice = 買價, AskPrice = 賣價, MatchedPrice = 成交價"
      ),
      trail_diff: z.number().describe("價格跳動調整（正負數）"),
    },
    async (params) => {
      try {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "條件單功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
          );
        }

        // Build trail order object
        const trailOrder: any = {
          symbol: params.trail_symbol,
          price: String(params.trail_price),
          direction: params.trail_direction as any,
          percentage: params.trail_percentage,
          buySell: params.trail_buysell as any,
          quantity: params.trail_quantity,
          priceType: params.trail_price_type as any,
          diff: params.trail_diff,
          timeInForce: "ROD" as any,
          orderType: "Stock" as any,
        };

        // Call SDK API
        const result = await sdk.stock.trailProfit(
          account,
          params.start_date,
          params.end_date,
          params.stop_sign as any,
          trailOrder
        );

        const response = `追蹤停利委託建立結果\n\`\`\`json\n${JSON.stringify(
          result,
          null,
          2
        )}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `建立追蹤停利委託時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
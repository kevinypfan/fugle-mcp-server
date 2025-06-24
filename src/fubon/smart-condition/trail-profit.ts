import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { 
  Account,
  StopSign,
  TrailOrder
} from "fubon-neo/trade";
import { z } from "zod";
import { loadToolDescription } from "./utils.js";

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
    loadToolDescription('trail-profit', '建立追蹤停利委託'),
    {
      start_date: z.string().describe("監控開始日期 (YYYYMMDD)"),
      end_date: z.string().describe("監控結束日期 (YYYYMMDD)"),
      stop_sign: z.enum(["Full", "Partial", "UntilEnd"]).describe(
        "停損條件：Full = 全部成交後結束, Partial = 部分成交後結束, UntilEnd = 委託持續到結束日期"
      ),
      
      // Trail order object
      trail_symbol: z.string().describe("追蹤股票代號"),
      trail_price: z.number().describe("基準價格（只可輸入至多小數點後兩位，若超出將造成系統洗價失敗）"),
      trail_direction: z.enum(["Up", "Down"]).describe(
        "追蹤方向：Up = 向上追蹤（下跌時，追蹤價追蹤下跌，通常為空單使用）, Down = 向下追蹤（上漲時，追蹤價追蹤上漲，通常為多單使用）"
      ),
      trail_percentage: z.number().describe("追蹤百分比閾值（整數，例如：5 代表 5%）- 當股價觸及以基準價計算的漲跌百分比時觸發下單"),
      trail_buysell: z.enum(["Buy", "Sell"]).describe("買賣別：Buy = 買進, Sell = 賣出"),
      trail_quantity: z.number().describe("委託股數（整數）"),
      trail_price_type: z.enum(["Limit", "Market", "BidPrice", "AskPrice", "MatchedPrice", "LimitUp", "LimitDown", "Reference"]).describe(
        "價格類型：Limit = 限價, Market = 市價, BidPrice = 買進價, AskPrice = 賣出價, MatchedPrice = 成交價, LimitUp = 漲停價, LimitDown = 跌停價, Reference = 參考價(平盤價)"
      ),
      trail_diff: z.number().describe("買賣價格檔數調整（根據價格類型加減檔數）- 正值為向上加檔數，負值為向下加檔數"),
      trail_time_in_force: z.enum(["ROD", "IOC", "FOK"]).describe(
        "委託條件：ROD = 當日有效(Rest of Day), IOC = 立即成交否則取消(Immediate-or-Cancel), FOK = 全部成交否則取消(Fill-or-Kill)"
      ),
      trail_order_type: z.enum(["Stock", "Margin", "Short"]).describe(
        "委託類型：Stock = 現股, Margin = 融資, Short = 融券"
      ),
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
          timeInForce: params.trail_time_in_force as any,
          orderType: params.trail_order_type as any,
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
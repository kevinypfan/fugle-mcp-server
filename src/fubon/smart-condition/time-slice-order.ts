import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { 
  Account,
  StopSign,
  SplitDescription,
  ConditionOrder
} from "fubon-neo/trade";
import { z } from "zod";

/**
 * Register time slice order tool to MCP Server
 */
export function registerTimeSliceOrderTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "time_slice_order",
    "建立時間切片委託",
    {
      start_date: z.string().describe("監控開始日期 (YYYYMMDD)"),
      end_date: z.string().describe("監控結束日期 (YYYYMMDD)"),
      stop_sign: z.enum(["Full", "Partial", "UntilEnd"]).describe(
        "停損條件：Full = 全部成交後結束, Partial = 部分成交後結束, UntilEnd = 委託持續到結束日期"
      ),
      
      // Split description object
      split_method: z.enum(["Type1", "Type2", "Type3"]).describe(
        "切片方法：Type1 = 時間間隔切片, Type2 = 數量均分切片, Type3 = 自定義切片"
      ),
      split_interval: z.number().describe("時間間隔（秒）"),
      split_single_quantity: z.number().describe("每次執行數量"),
      split_total_quantity: z.number().describe("總數量"),
      split_start_time: z.string().describe("開始時間 (HH:MM:SS)"),
      split_end_time: z.string().describe("結束時間 (HH:MM:SS)"),
      
      // Order object
      order_buy_sell: z.enum(["Buy", "Sell"]).describe("買賣別：Buy = 買, Sell = 賣"),
      order_symbol: z.string().describe("委託股票代號"),
      order_price: z.number().describe("委託價格"),
      order_quantity: z.number().describe("委託數量"),
      order_market_type: z.enum(["Common", "Fixing", "IntradayOdd", "Odd"]).describe(
        "市場類型：Common = 一般, Fixing = 定盤, IntradayOdd = 盤中零股, Odd = 零股"
      ),
      order_price_type: z.enum(["Limit", "Market", "BidPrice", "AskPrice", "MatchedPrice"]).describe(
        "價格類型：Limit = 限價, Market = 市價, BidPrice = 買價, AskPrice = 賣價, MatchedPrice = 成交價"
      ),
      order_time_in_force: z.enum(["ROD", "IOC", "FOK"]).describe(
        "委託條件：ROD = 當日有效, IOC = 立即成交否則取消, FOK = 全部成交否則取消"
      ),
      order_order_type: z.enum(["Stock", "Margin", "Short"]).describe(
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

        // Build split description object
        const splitDescription: SplitDescription = {
          method: params.split_method as any,
          interval: params.split_interval,
          singleQuantity: params.split_single_quantity,
          totalQuantity: params.split_total_quantity,
          startTime: params.split_start_time,
          endTime: params.split_end_time,
        };

        // Build order object
        const order: any = {
          buySell: params.order_buy_sell as any,
          symbol: params.order_symbol,
          price: String(params.order_price),
          quantity: params.order_quantity,
          marketType: params.order_market_type as any,
          priceType: params.order_price_type as any,
          timeInForce: params.order_time_in_force as any,
          orderType: params.order_order_type as any,
        };

        // Call SDK API
        const result = await sdk.stock.timeSliceOrder(
          account,
          params.start_date,
          params.end_date,
          params.stop_sign as any,
          splitDescription,
          order
        );

        const response = `時間切片委託建立結果\n\`\`\`json\n${JSON.stringify(
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
              text: `建立時間切片委託時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
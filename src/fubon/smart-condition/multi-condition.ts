import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { 
  Account,
  StopSign,
  Condition,
  ConditionOrder
} from "fubon-neo/trade";
import { z } from "zod";

/**
 * Register multi condition order tool to MCP Server
 */
export function registerMultiConditionTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "multi_condition_order",
    "建立多重條件單",
    {
      start_date: z.string().describe("監控開始日期 (YYYYMMDD)"),
      end_date: z.string().describe("監控結束日期 (YYYYMMDD)"),
      stop_sign: z.enum(["Full", "Partial", "UntilEnd"]).describe(
        "停損條件：Full = 全部成交後結束, Partial = 部分成交後結束, UntilEnd = 委託持續到結束日期"
      ),
      
      // Multiple conditions array (JSON string)
      conditions: z.string().describe(
        "條件陣列 JSON 字串，格式：[{\"market_type\":\"Reference\",\"symbol\":\"2330\",\"trigger\":\"MatchedPrice\",\"trigger_value\":500,\"comparison\":\"GreaterThan\"}]"
      ),
      
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
      
      // Optional TPSL
      tpsl_stop_sign: z.enum(["Full", "Partial", "UntilEnd"]).optional().describe(
        "TPSL停損條件（選填）"
      ),
      tpsl_end_date: z.string().optional().describe("TPSL結束日期（選填，YYYYMMDD）"),
      tpsl_intraday: z.boolean().optional().describe("TPSL當日沖銷（選填）"),
      
      // Take Profit order (optional)
      tp_buy_sell: z.enum(["Buy", "Sell"]).optional().describe("停利買賣別（選填）"),
      tp_symbol: z.string().optional().describe("停利股票代號（選填）"),
      tp_price: z.number().optional().describe("停利價格（選填）"),
      tp_quantity: z.number().optional().describe("停利數量（選填）"),
      tp_market_type: z.enum(["Common", "Fixing", "IntradayOdd", "Odd"]).optional().describe("停利市場類型（選填）"),
      tp_price_type: z.enum(["Limit", "Market", "BidPrice", "AskPrice", "MatchedPrice"]).optional().describe("停利價格類型（選填）"),
      tp_time_in_force: z.enum(["ROD", "IOC", "FOK"]).optional().describe("停利委託條件（選填）"),
      tp_order_type: z.enum(["Stock", "Margin", "Short"]).optional().describe("停利委託類型（選填）"),
      
      // Stop Loss order (optional)
      sl_buy_sell: z.enum(["Buy", "Sell"]).optional().describe("停損買賣別（選填）"),
      sl_symbol: z.string().optional().describe("停損股票代號（選填）"),
      sl_price: z.number().optional().describe("停損價格（選填）"),
      sl_quantity: z.number().optional().describe("停損數量（選填）"),
      sl_market_type: z.enum(["Common", "Fixing", "IntradayOdd", "Odd"]).optional().describe("停損市場類型（選填）"),
      sl_price_type: z.enum(["Limit", "Market", "BidPrice", "AskPrice", "MatchedPrice"]).optional().describe("停損價格類型（選填）"),
      sl_time_in_force: z.enum(["ROD", "IOC", "FOK"]).optional().describe("停損委託條件（選填）"),
      sl_order_type: z.enum(["Stock", "Margin", "Short"]).optional().describe("停損委託類型（選填）"),
    },
    async (params) => {
      try {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "條件單功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
          );
        }

        // Parse conditions JSON
        let conditions;
        try {
          conditions = JSON.parse(params.conditions);
          if (!Array.isArray(conditions)) {
            throw new Error("conditions 必須是陣列格式");
          }
        } catch (parseError) {
          throw new Error(`解析 conditions JSON 失敗: ${parseError}`);
        }

        // Validate each condition
        for (const condition of conditions) {
          if (!condition.market_type || !condition.symbol || !condition.trigger || 
              condition.trigger_value === undefined || !condition.comparison) {
            throw new Error("每個條件必須包含 market_type, symbol, trigger, trigger_value, comparison 欄位");
          }
        }

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

        // Build TPSL object if provided
        let tpsl: any = undefined;
        if (params.tpsl_stop_sign) {
          tpsl = {
            stop_sign: params.tpsl_stop_sign as StopSign,
            end_date: params.tpsl_end_date,
            intraday: params.tpsl_intraday,
          } as any;

          // Add take profit order if provided
          if (params.tp_buy_sell) {
            tpsl.tp = {
              buySell: params.tp_buy_sell as any,
              symbol: params.tp_symbol!,
              price: String(params.tp_price!),
              quantity: params.tp_quantity!,
              marketType: params.tp_market_type! as any,
              priceType: params.tp_price_type! as any,
              timeInForce: params.tp_time_in_force! as any,
              orderType: params.tp_order_type! as any,
            };
          }

          // Add stop loss order if provided
          if (params.sl_buy_sell) {
            tpsl.sl = {
              buySell: params.sl_buy_sell as any,
              symbol: params.sl_symbol!,
              price: String(params.sl_price!),
              quantity: params.sl_quantity!,
              marketType: params.sl_market_type! as any,
              priceType: params.sl_price_type! as any,
              timeInForce: params.sl_time_in_force! as any,
              orderType: params.sl_order_type! as any,
            };
          }
        }

        // Call SDK API
        const result = await sdk.stock.multiCondition(
          account,
          params.start_date,
          params.end_date,
          params.stop_sign as any,
          conditions,
          order,
          tpsl
        );

        const response = `多重條件單建立結果\n\`\`\`json\n${JSON.stringify(
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
              text: `建立多重條件單時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
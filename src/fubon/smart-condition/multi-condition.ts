import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { 
  Account,
  Condition,
  ConditionOrder
} from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * Register multi condition order tool to MCP Server
 */
export function registerMultiConditionTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'multi-condition', '建立多重條件單');

  server.tool(
    "multi_condition_order",
    description,
    {
      start_date: z.string().describe("監控開始日期 (YYYYMMDD)"),
      end_date: z.string().describe("監控結束日期 (YYYYMMDD)"),
      stop_sign: z.enum(["Full", "Partial", "UntilEnd"]).describe(
        "停損條件：Full = 全部成交後結束, Partial = 部分成交後結束, UntilEnd = 委託持續到結束日期"
      ),
      
      // Multiple conditions array (JSON string)
      conditions: z.string().describe(
        "條件陣列 JSON 字串，格式：[{\"marketType\":\"Reference|Scheduled\",\"symbol\":\"2330\",\"trigger\":\"BidPrice|AskPrice|MatchedPrice|TotalQuantity|Time\",\"triggerValue\":\"500\",\"comparison\":\"GreaterThanOrEqual|LessThanOrEqual|GreaterThan|LessThan\"}]"
      ),
      
      // Order object
      order_buy_sell: z.enum(["Buy", "Sell"]).describe("買賣別：Buy = 買, Sell = 賣"),
      order_symbol: z.string().describe("委託股票代號"),
      order_price: z.number().describe("委託價格"),
      order_quantity: z.number().describe("委託數量"),
      order_market_type: z.enum(["Common", "Fixing", "IntradayOdd", "Odd"]).describe(
        "市場類型：Common = 整股, Fixing = 定盤, IntradayOdd = 盤中零股, Odd = 盤後零股"
      ),
      order_price_type: z.enum(["Limit", "Market", "BidPrice", "AskPrice", "MatchedPrice", "LimitUp", "LimitDown", "Reference"]).describe(
        "價格類型：Limit = 限價, Market = 市價, BidPrice = 買價, AskPrice = 賣價, MatchedPrice = 成交價, LimitUp = 漲停, LimitDown = 跌停, Reference = 參考價(平盤價)"
      ),
      order_time_in_force: z.enum(["ROD", "IOC", "FOK"]).describe(
        "委託條件：ROD = 當日有效, IOC = 立即成交否則取消, FOK = 全部成交否則取消"
      ),
      order_order_type: z.enum(["Stock", "Margin", "Short"]).describe(
        "委託類型：Stock = 現股, Margin = 融資, Short = 融券"
      ),
      
      // Optional TPSL
      tpsl_stop_sign: z.enum(["Full", "Partial", "UntilEnd"]).optional().describe(
        "TPSL停損條件（選填）：Full=全部成交為止, Partial=部分成交為止, UntilEnd=效期結束為止"
      ),
      tpsl_end_date: z.string().optional().describe("TPSL結束日期（選填，YYYYMMDD）"),
      tpsl_intraday: z.boolean().optional().describe("TPSL當日沖銷（選填）"),
      
      // Take Profit order (optional)
      tp_target_price: z.number().optional().describe("停利觸發價（選填）"),
      tp_price: z.number().optional().describe("停利委託價（選填）"),
      tp_price_type: z.enum(["Limit", "Market", "BidPrice", "AskPrice", "MatchedPrice", "LimitUp", "LimitDown", "Reference"]).optional().describe("停利價格類型（選填）：Limit=限價, Market=市價, BidPrice=買價, AskPrice=賣價, MatchedPrice=成交價, LimitUp=漲停, LimitDown=跌停, Reference=參考價"),
      tp_time_in_force: z.enum(["ROD", "IOC", "FOK"]).optional().describe("停利委託條件（選填）：ROD=當日有效, IOC=立即成交否則取消, FOK=全部成交否則取消"),
      tp_order_type: z.enum(["Stock", "Margin", "Short"]).optional().describe("停利委託類型（選填）：Stock=現股, Margin=融資, Short=融券"),
      tp_trigger: z.enum(["BidPrice", "AskPrice", "MatchedPrice"]).optional().describe("停利觸發條件（選填）：BidPrice=買價, AskPrice=賣價, MatchedPrice=成交價"),
      
      // Stop Loss order (optional)
      sl_target_price: z.number().optional().describe("停損觸發價（選填）"),
      sl_price: z.number().optional().describe("停損委託價（選填）"),
      sl_price_type: z.enum(["Limit", "Market", "BidPrice", "AskPrice", "MatchedPrice", "LimitUp", "LimitDown", "Reference"]).optional().describe("停損價格類型（選填）：Limit=限價, Market=市價, BidPrice=買價, AskPrice=賣價, MatchedPrice=成交價, LimitUp=漲停, LimitDown=跌停, Reference=參考價"),
      sl_time_in_force: z.enum(["ROD", "IOC", "FOK"]).optional().describe("停損委託條件（選填）：ROD=當日有效, IOC=立即成交否則取消, FOK=全部成交否則取消"),
      sl_order_type: z.enum(["Stock", "Margin", "Short"]).optional().describe("停損委託類型（選填）：Stock=現股, Margin=融資, Short=融券"),
      sl_trigger: z.enum(["BidPrice", "AskPrice", "MatchedPrice"]).optional().describe("停損觸發條件（選填）：BidPrice=買價, AskPrice=賣價, MatchedPrice=成交價"),
    },
    createToolHandler(
      currentDir,
      'multi-condition',
      async (params) => {
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
          if (!condition.marketType || !condition.symbol || !condition.trigger || 
              condition.triggerValue === undefined || !condition.comparison) {
            throw new Error("每個條件必須包含 marketType, symbol, trigger, triggerValue, comparison 欄位");
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
            stopSign: params.tpsl_stop_sign as any,
            endDate: params.tpsl_end_date,
            intraday: params.tpsl_intraday,
          } as any;

          // Add take profit order if provided
          if (params.tp_target_price) {
            tpsl.tp = {
              targetPrice: String(params.tp_target_price),
              price: params.tp_price ? String(params.tp_price) : "",
              priceType: params.tp_price_type! as any,
              timeInForce: params.tp_time_in_force! as any,
              orderType: params.tp_order_type! as any,
              trigger: params.tp_trigger as any,
            };
          }

          // Add stop loss order if provided
          if (params.sl_target_price) {
            tpsl.sl = {
              targetPrice: String(params.sl_target_price),
              price: params.sl_price ? String(params.sl_price) : "",
              priceType: params.sl_price_type! as any,
              timeInForce: params.sl_time_in_force! as any,
              orderType: params.sl_order_type! as any,
              trigger: params.sl_trigger as any,
            };
          }
        }

        // Call SDK API
        return await sdk.stock.multiCondition(
          account,
          params.start_date,
          params.end_date,
          params.stop_sign as any,
          conditions,
          order,
          tpsl
        );
      },
      {
        errorMessage: "建立多重條件單時發生錯誤"
      }
    )
  );
}
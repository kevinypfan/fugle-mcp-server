import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import {
  Account,
  BSAction,
  MarketType,
  PriceType,
  TimeInForce,
  OrderType,
} from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";

/**
 * 註冊建立委託單工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerPlaceOrderTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'place-order', '建立委託單');
  
  server.tool(
    "place_order",
    description,
    {
      buySell: z.enum(["Buy", "Sell"]).describe("買賣別：Buy = 買, Sell = 賣"),
      symbol: z.string().describe("股票代號，例如：2330"),
      price: z.string().optional().describe("委託價格"),
      quantity: z.number().describe("委託數量"),
      marketType: z
        .enum(["Common", "Fixing", "IntradayOdd", "Odd", "Emg", "EmgOdd"])
        .describe(
          "盤別種類：Common = 整股, Fixing = 定盤, IntradayOdd = 盤中零股, Odd = 盤後零股, Emg = 興櫃, EmgOdd = 興櫃零股"
        ),
      priceType: z
        .enum(["Limit", "LimitUp", "LimitDown", "Market", "Reference"])
        .describe(
          "價格別：Limit = 限價, LimitUp = 漲停, LimitDown = 跌停, Market = 市價, Reference = 參考價"
        ),
      timeInForce: z
        .enum(["ROD", "FOK", "IOC"])
        .describe("委託條件別：ROD = ROD, FOK = FOK, IOC = IOC"),
      orderType: z
        .enum(["Stock", "Margin", "Short", "DayTrade"])
        .describe(
          "委託單類型：Stock = 現股, Margin = 融資, Short = 融券, DayTrade = 現股當沖"
        ),
      userDef: z.string().optional().describe("使用者自定義內容"),
    },
    createToolHandler(
      currentDir,
      'place-order',
      async ({
        buySell,
        symbol,
        price,
        quantity,
        marketType,
        priceType,
        timeInForce,
        orderType,
        userDef,
      }) => {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "修改委託價格功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
          );
        }

        // 建立委託單物件，使用 type assertion 來轉換列舉
        const order = {
          buySell: buySell as BSAction,
          symbol,
          price,
          quantity,
          marketType: marketType as MarketType,
          priceType: priceType as PriceType,
          timeInForce: timeInForce as TimeInForce,
          orderType: orderType as OrderType,
          userDef,
        };

        // 透過SDK下單
        return await sdk.stock.placeOrder(account, order, false);
      },
      {
        errorMessage: "建立委託單時發生錯誤"
      }
    )
  );
}
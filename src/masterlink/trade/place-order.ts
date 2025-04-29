import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import { BSAction, MarketType, PriceType, TimeInForce, OrderType } from "masterlink-sdk";
import placeOrderReference from "./references/place-order.json";

/**
 * 註冊下單相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerPlaceOrderTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  account: Account
) {
  // 建立委託單工具
  server.tool(
    "place_order",
    "建立委託單",
    {
      buySell: z
        .enum(["Buy", "Sell"])
        .describe("買賣別：Buy（買進）、Sell（賣出）"),
      symbol: z.string().describe("股票代號，例如：2888"),
      price: z.string().describe("委託價格，例如：11.5（市價時可為空字串）"),
      quantity: z.number().positive().describe("委託數量（單位：股）"),
      marketType: z
        .enum(["Common", "Fixing", "IntradayOdd", "Odd", "Emg"])
        .describe(
          "盤別：Common 整股、Fixing 定盤、IntradayOdd 盤中零股、Odd 盤後零股、Emg 興櫃"
        ),
      priceType: z
        .enum(["Limit", "LimitUp", "LimitDown", "Market", "Reference"])
        .describe(
          "價格旗標：Limit 限價、LimitUp 漲停、LimitDown 跌停、Market 市價、Reference 參考價"
        ),
      timeInForce: z
        .enum(["ROD", "FOK", "IOC"])
        .describe("委託條件：ROD、FOK、IOC"),
      orderType: z
        .enum(["Stock", "Margin", "Short", "DayTradeShort"])
        .describe(
          "委託類別：Stock 現股、Margin 融資、Short 融券、DayTradeShort 現股當沖"
        ),
    },
    async ({
      buySell,
      symbol,
      price,
      quantity,
      marketType,
      priceType,
      timeInForce,
      orderType,
    }) => {
      try {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error("下單功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )");
        }

        // 建立委託單
        const data = await sdk.stock.placeOrder(account, {
          buySell: buySell as BSAction,
          symbol,
          price: price || "",
          quantity,
          marketType: marketType as MarketType,
          priceType: priceType as PriceType,
          timeInForce: timeInForce as TimeInForce,
          orderType: orderType as OrderType,
        });

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(placeOrderReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `建立委託單時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
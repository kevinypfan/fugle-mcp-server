import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import { BSAction, MarketType, PriceType, TimeInForce, OrderType } from "masterlink-sdk";

/**
 * 註冊下單相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerPlaceOrderTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
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
      quantity: z.number().int().positive().describe("委託數量（單位：股）"),
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
        // 處理 enum 轉換 - 添加預設值確保不會有 undefined
        let bsActionValue: BSAction;
        let marketTypeValue: MarketType;
        let priceTypeValue: PriceType;
        let timeInForceValue: TimeInForce;
        let orderTypeValue: OrderType;

        // 直接映射並設置預設值
        switch (buySell) {
          case "Buy": bsActionValue = BSAction.Buy; break;
          case "Sell": bsActionValue = BSAction.Sell; break;
          default: throw new Error(`不支援的買賣別: ${buySell}`);
        }

        switch (marketType) {
          case "Common": marketTypeValue = MarketType.Common; break;
          case "Fixing": marketTypeValue = MarketType.Fixing; break;
          case "IntradayOdd": marketTypeValue = MarketType.IntradayOdd; break;
          case "Odd": marketTypeValue = MarketType.Odd; break;
          case "Emg": marketTypeValue = MarketType.Emg; break;
          default: throw new Error(`不支援的盤別: ${marketType}`);
        }

        switch (priceType) {
          case "Limit": priceTypeValue = PriceType.Limit; break;
          case "LimitUp": priceTypeValue = PriceType.LimitUp; break;
          case "LimitDown": priceTypeValue = PriceType.LimitDown; break;
          case "Market": priceTypeValue = PriceType.Market; break;
          case "Reference": priceTypeValue = PriceType.Reference; break;
          default: throw new Error(`不支援的價格旗標: ${priceType}`);
        }

        switch (timeInForce) {
          case "ROD": timeInForceValue = TimeInForce.ROD; break;
          case "FOK": timeInForceValue = TimeInForce.FOK; break;
          case "IOC": timeInForceValue = TimeInForce.IOC; break;
          default: throw new Error(`不支援的委託條件: ${timeInForce}`);
        }

        switch (orderType) {
          case "Stock": orderTypeValue = OrderType.Stock; break;
          case "Margin": orderTypeValue = OrderType.Margin; break;
          case "Short": orderTypeValue = OrderType.Short; break;
          case "DayTradeShort": orderTypeValue = OrderType.DayTradeShort; break;
          default: throw new Error(`不支援的委託類別: ${orderType}`);
        }

        const order = {
          buySell: bsActionValue,
          symbol,
          price,
          quantity,
          marketType: marketTypeValue,
          priceType: priceTypeValue,
          timeInForce: timeInForceValue,
          orderType: orderTypeValue,
        };

        const result = await sdk.stock.placeOrder(accounts[0], order);

        return {
          content: [
            {
              type: "text",
              text: `✅ 下單成功：${buySell} ${symbol} 數量 ${quantity} 價格 ${price}（委託編號：${result.orderNo}）`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `❌ 下單失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}
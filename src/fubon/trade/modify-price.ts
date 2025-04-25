import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import modifyPriceReference from "./references/modify-price.json";
import { FubonSDK } from "fubon-neo";
import { Account, PriceType } from "fubon-neo/trade";
import { z } from "zod";
  
/**
 * 註冊改價工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerModifyPriceTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "modify_price",
    "修改委託單價格",
    {
      orderNo: z.string().describe("委託書號"),
      stockNo: z.string().describe("股票代號"),
      marketType: z.enum(["Common", "Fixing", "IntradayOdd", "Odd", "Emg", "EmgOdd"])
        .describe("盤別種類：Common = 整股, Fixing = 定盤, IntradayOdd = 盤中零股, Odd = 盤後零股, Emg = 興櫃, EmgOdd = 興櫃零股"),
      price: z.string().describe("新委託價格"),
      priceType: z.enum(["Limit", "LimitUp", "LimitDown", "Market", "Reference"])
        .describe("價格別：Limit = 限價, LimitUp = 漲停, LimitDown = 跌停, Market = 市價, Reference = 參考價")
    },
    async ({ orderNo, stockNo, marketType, price, priceType }) => {
      try {
        // 透過SDK修改委託單價格
        // 根據 ModifyPrice 介面，應該不包含 marketType，且使用 newPrice 而非 price
        const data = await sdk.stock.modifyPrice(account, {
          txse: "",  // 交易所代碼
          date: new Date().toLocaleDateString(),
          asty: "0",  // 資產類別
          orderNo,
          stockNo,
          newPrice: price,  // 使用 newPrice 而非 price
          priceType: priceType as PriceType  // 使用 type assertion
        }, false);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(modifyPriceReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `修改委託單價格時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

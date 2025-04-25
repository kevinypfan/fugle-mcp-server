import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import modifyQuantityReference from "./references/modify-quantity.json";
import { FubonSDK } from "fubon-neo";
import { Account, MarketType } from "fubon-neo/trade";
import { z } from "zod";
  
/**
 * 註冊改量工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerModifyQuantityTool(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  server.tool(
    "modify_quantity",
    "修改委託單數量",
    {
      orderNo: z.string().describe("委託書號"),
      stockNo: z.string().describe("股票代號"),
      marketType: z.enum(["Common", "Fixing", "IntradayOdd", "Odd", "Emg", "EmgOdd"])
        .describe("盤別種類：Common = 整股, Fixing = 定盤, IntradayOdd = 盤中零股, Odd = 盤後零股, Emg = 興櫃, EmgOdd = 興櫃零股"),
      quantity: z.number().describe("新委託數量")
    },
    async ({ orderNo, stockNo, marketType, quantity }) => {
      try {
        // 透過SDK修改委託單數量
        const data = await sdk.stock.modifyQuantity(account, {
          txse: "",  // 交易所代碼
          date: new Date().toLocaleDateString(),
          asty: "0",  // 資產類別
          orderNo,
          stockNo,
          marketType: marketType as MarketType,  // 使用 type assertion
          newQuantity: quantity  // SDK中使用 newQuantity 作為參數
        }, false);

        const response = `API Response\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nField Description\n\`\`\`json\n${JSON.stringify(modifyQuantityReference, null, 2)}\n\`\`\``;

        return {
          content: [{ type: "text", text: response }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `修改委託單數量時發生錯誤: ${error || "未知錯誤"}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

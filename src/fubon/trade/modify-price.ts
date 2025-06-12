import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account, PriceType } from "fubon-neo/trade";
import { z } from "zod";
import { loadToolMetadata, createToolHandler } from "../../shared/utils/index.js";
  
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
  const currentDir = __dirname;
  const { description } = loadToolMetadata(currentDir, 'modify-price', '修改委託單價格');
  
  server.tool(
    "modify_price",
    description,
    {
      seqNo: z.string().describe("委託單流水序號"),
      price: z.string().optional().describe("新委託價格 (與 priceType 擇一填寫)"),
      priceType: z.enum(["Limit", "LimitUp", "LimitDown", "Market", "Reference"])
        .optional()
        .describe("價格別：Limit = 限價, LimitUp = 漲停, LimitDown = 跌停, Market = 市價, Reference = 參考價 (與 price 擇一填寫)")
    },
    createToolHandler(
      currentDir,
      'modify-price',
      async ({ seqNo, price, priceType }) => {
        if (process.env.ENABLE_ORDER !== "true") {
          throw new Error(
            "修改委託價格功能已停用！(啟用此功能請在環境變數中設定 ENABLE_ORDER 為 true )"
          );
        }

        // 確認 price 與 priceType 至少有一個有值，且不能同時有值
        if ((price && priceType) || (!price && !priceType)) {
          throw new Error("price 和 priceType 必須擇一填寫");
        }

        // 先獲取委託單資訊
        const orderResultRes = await sdk.stock.getOrderResults(account);
        if (!orderResultRes.isSuccess) {
          throw new Error(`取得委託單資訊失敗：${orderResultRes.message}`);
        }

        const targetOrder = orderResultRes.data?.find((order) => order.seqNo === seqNo);

        if (!targetOrder) {
          throw new Error(`修改委託單價格失敗：找不到委託單流水序號 ${seqNo} 的委託單`);
        }

        // 使用 makeModifyPriceObj 建立修改價格物件
        const modifyPriceObj = price 
          ? sdk.stock.makeModifyPriceObj(targetOrder, price)
          : sdk.stock.makeModifyPriceObj(targetOrder, null, priceType as PriceType);

        // 透過SDK修改委託單價格
        return await sdk.stock.modifyPrice(account, modifyPriceObj, false);
      },
      {
        errorMessage: "修改委託單價格時發生錯誤"
      }
    )
  );
}
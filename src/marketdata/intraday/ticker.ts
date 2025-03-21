import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RestStockClient } from "masterlink-sdk/marketdata/rest/stock/client";
import { z } from "zod";

// 證券別代碼對照表
const SECURITY_TYPES: { [key: string]: string } = {
  "01": "一般股票",
  "02": "轉換公司債",
  "03": "交換公司債或交換金融債",
  "04": "一般特別股",
  "05": "可交換特別股",
  "06": "認股權憑證",
  "07": "附認股權特別股",
  "08": "附認股權公司債",
  "09": "附認股權公司債履約或分拆後之公司債",
  "10": "國內標的認購權證",
  "11": "國內標的認售權證",
  "12": "外國標的認購權證",
  "13": "外國標的認售權證",
  "14": "國內標的下限型認購權證",
  "15": "國內標的上限型認售權證",
  "16": "國內標的可展延下限型認購權證",
  "17": "國內標的可展延上限型認售權證",
  "18": "受益憑證(封閉式基金)",
  "19": "存託憑證",
  "20": "存託憑證可轉換公司債",
  "21": "存託憑證附認股權公司債",
  "22": "存託憑證附認股權公司債履約或分拆後之公司債",
  "23": "存託憑證認股權憑證",
  "24": "ETF",
  "25": "ETF（外幣計價）",
  "26": "槓桿型ETF",
  "27": "槓桿型 ETF（外幣計價）",
  "28": "反向型 ETF",
  "29": "反向型 ETF（外幣計價）",
  "30": "期信託 ETF",
  "31": "期信託 ETF（外幣計價）",
  "32": "債券 ETF",
  "33": "債券 ETF（外幣計價）",
  "34": "金融資產證券化受益證券",
  "35": "不動產資產信託受益證券",
  "36": "不動產投資信託受益證券",
  "37": "ETN",
  "38": "槓桿型 ETN",
  "39": "反向型 ETN",
  "40": "債券型 ETN",
  "41": "期權策略型 ETN",
  "42": "中央登錄公債",
  "43": "外國債券",
  "44": "黃金現貨",
  "00": "未知或保留代碼",
};

/**
 * 註冊股票資訊相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} stock 股票 API 客戶端
 */
export function registerTickerTools(server: McpServer, stock: RestStockClient) {
  // 獲取股票詳細資訊工具
  server.tool(
    "get_stock_intraday_ticker",
    "取得股票詳細資訊",
    {
      symbol: z.string().describe("股票代碼，例如：2330"),
      type: z.literal("oddlot").optional().describe("類型，盤中零股"),
    },
    async ({ symbol, type }) => {
      try {
        // 透過API獲取股票基本資訊
        const data = await stock.intraday.ticker({ symbol, type });

        // 格式化證券別資訊
        const securityTypeDesc = data.securityType
          ? `${data.securityType} (${
              SECURITY_TYPES[data.securityType] || "未知"
            })`
          : "未提供";

        // 格式化回應內容
        let responseText = `
【${data.symbol} ${data.name}】股票基本資訊：

基本資料：
交易所: ${data.exchange || "未提供"}
市場別: ${data.market || "未提供"}
產業別: ${data.industry || "未提供"}
證券別: ${securityTypeDesc}
交易單位: ${data.boardLot ? data.boardLot.toLocaleString() + "股" : "未提供"}
交易幣別: ${data.tradingCurrency || "未提供"}

價格資訊：
參考價: ${data.referencePrice || "未提供"}
漲停價: ${data.limitUpPrice || "未提供"}
跌停價: ${data.limitDownPrice || "未提供"}
前一交易日收盤價: ${data.previousClose || "未提供"}

交易規則：
證券狀態: ${data.securityStatus || "未提供"}
可現股當沖: ${data.canDayTrade ? "是" : "否"}
可先買當沖: ${data.canBuyDayTrade ? "是" : "否"}
平盤下可融券賣出: ${data.canBelowFlatMarginShortSell ? "是" : "否"}
平盤下可借券賣出: ${data.canBelowFlatSBLShortSell ? "是" : "否"}

特殊狀態：
注意股: ${data.isAttention ? "是" : "否"}
處置股: ${data.isDisposition ? "是" : "否"}
異常推介個股: ${data.isUnusuallyRecommended ? "是" : "否"}
特殊異常個股: ${data.isSpecificAbnormally ? "是" : "否"}
        `;

        // 如果是權證，添加權證特有資訊
        if (
          data.securityType &&
          ["10", "11", "12", "13", "14", "15", "16", "17"].includes(
            data.securityType
          )
        ) {
          responseText += `
權證特有資訊：
履約價格: ${data.exercisePrice || "未提供"}
行使比率: ${data.exerciseRatio || "未提供"}
到期日: ${data.maturityDate || "未提供"}
上限價格: ${data.limitUpPrice || "未提供"}
下限價格: ${data.limitDownPrice || "未提供"}
前一交易日履約數量: ${
            data.exercisedVolume
              ? data.exercisedVolume.toLocaleString()
              : "未提供"
          }
前一交易日註銷數量: ${
            data.cancelledVolume
              ? data.cancelledVolume.toLocaleString()
              : "未提供"
          }
發行餘額量: ${
            data.remainingVolume
              ? data.remainingVolume.toLocaleString()
              : "未提供"
          }
          `;
        }

        return {
          content: [{ type: "text", text: responseText }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `查詢股票 ${symbol} 詳細資訊時發生錯誤: ${
                error || "未知錯誤"
              }`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

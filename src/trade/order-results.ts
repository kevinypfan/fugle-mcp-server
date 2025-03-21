import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Account, MasterlinkSDK } from "masterlink-sdk";
import { z } from "zod";
import { QueryType } from "masterlink-sdk";

/**
 * 註冊查詢委託單相關的工具到 MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk MasterlinkSDK 實例
 * @param {Object} accounts 帳戶實例陣列
 */
export function registerOrderResultTools(
  server: McpServer,
  sdk: MasterlinkSDK,
  accounts: Account[]
) {
  // 取得委託單結果工具
  server.tool(
    "get_order_results",
    "查詢委託單結果",
    {
      queryType: z
        .enum(["All", "Reservation", "RegularSession", "Cancelable", "Failed"])
        .describe(
          "盤別：All 全部、Reservation 預約單、RegularSession 盤中、Cancelable 可取消委託、Failed 失敗單"
        )
        .default("All")
        .optional(),
    },
    async ({ queryType }) => {
      try {
        // 處理 enum 轉換
        let queryTypeValue: QueryType;

        // 如果未提供 queryType，預設為 All
        if (!queryType) {
          queryTypeValue = QueryType.All;
        } else {
          switch (queryType) {
            case "All":
              queryTypeValue = QueryType.All;
              break;
            case "Reservation":
              queryTypeValue = QueryType.Reservation;
              break;
            case "RegularSession":
              queryTypeValue = QueryType.RegularSession;
              break;
            case "Cancelable":
              queryTypeValue = QueryType.Cancelable;
              break;
            case "Failed":
              queryTypeValue = QueryType.Failed;
              break;
            default:
              throw new Error(`不支援的查詢類型: ${queryType}`);
          }
        }

        // 透過SDK獲取委託單結果
        const orderResults = await sdk.stock.getOrderResults(
          accounts[0],
          queryTypeValue
        );

        // 如果沒有委託單結果
        if (!orderResults || orderResults.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `📋 查無委託單紀錄`,
              },
            ],
          };
        }

        // 格式化回應內容
        const formatOrders = orderResults.map((order) => {
          return {
            委託日期: order.orderDate,
            委託時間: formatOrderTime(order.orderTime || "0"),
            股票代號: order.symbol,
            買賣別: order.buySell === "Buy" ? "買入" : "賣出",
            價格: order.orderPrice.toFixed(2),
            原始股數: formatNumber(order.orgQty),
            已成交: formatNumber(order.filledQty),
            已取消: formatNumber(order.celQty),
            狀態: getOrderStatus(order),
            可取消: order.canCancel ? "✓" : "-",
            委託書號: order.orderNo,
          };
        });

        // 構建回應文本
        let responseText = `📋 **委託單查詢結果**\n\n`;

        // 添加查詢條件說明
        responseText += `查詢條件：${getQueryTypeDescription(
          queryType || "All"
        )}\n`;
        responseText += `總共 ${orderResults.length} 筆委託\n\n`;

        // 添加表格形式的委託單列表
        responseText += formatOrdersTable(formatOrders);

        // 添加提示信息
        responseText += `\n\n您可以使用「取消委託單」功能來取消狀態為「可取消」的委託單。`;

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `❌ 查詢委託單失敗：${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}

/**
 * 格式化委託時間（從毫秒格式轉為可讀格式）
 * @param timeStr 委託時間字串
 * @returns 格式化後的時間字串
 */
function formatOrderTime(timeStr: string): string {
  if (!timeStr || timeStr.length < 9) return timeStr;

  // 假設格式為 HHMMSSXXX，取出時分秒部分
  const hour = timeStr.substring(0, 2);
  const minute = timeStr.substring(2, 4);
  const second = timeStr.substring(4, 6);

  return `${hour}:${minute}:${second}`;
}

/**
 * 格式化數字（添加千位分隔符）
 * @param num 數字
 * @returns 格式化後的數字字串
 */
function formatNumber(num: number): string {
  return num.toLocaleString("zh-TW");
}

/**
 * 獲取委託單狀態描述
 * @param order 委託單記錄
 * @returns 狀態描述
 */
function getOrderStatus(order: any): string {
  // 檢查是否有錯誤
  if (order.errCode && order.errCode !== "000000") {
    return `失敗：${order.errMsg || "未知錯誤"}`;
  }

  // 檢查是否是預約單
  if (order.isPreOrder) {
    return "預約單";
  }

  // 檢查成交狀態
  if (order.filledQty === 0 && order.celQty === 0) {
    return "委託中";
  } else if (
    order.filledQty > 0 &&
    order.filledQty < order.orgQty &&
    order.celQty === 0
  ) {
    return "部分成交";
  } else if (order.filledQty === order.orgQty) {
    return "全部成交";
  } else if (order.celQty > 0 && order.celQty === order.orgQty) {
    return "全部取消";
  } else if (order.celQty > 0 && order.celQty < order.orgQty) {
    return "部分取消";
  }

  return "處理中";
}

/**
 * 獲取查詢類型的中文描述
 * @param queryType 查詢類型
 * @returns 查詢類型描述
 */
function getQueryTypeDescription(queryType: string): string {
  switch (queryType) {
    case "All":
      return "全部委託";
    case "Reservation":
      return "預約單";
    case "RegularSession":
      return "盤中委託";
    case "Cancelable":
      return "可取消委託";
    case "Failed":
      return "失敗委託";
    default:
      return queryType;
  }
}

/**
 * 格式化委託單記錄為表格形式的文本
 * @param orders 格式化後的委託單記錄
 * @returns 表格形式的文本
 */
function formatOrdersTable(orders: any[]): string {
  if (!orders || orders.length === 0) return "無委託單記錄";

  // 表頭
  const headers = Object.keys(orders[0]);

  // 計算每列最大寬度
  const columnWidths = headers.map((header) => {
    // 初始為表頭長度
    let maxWidth = header.length;

    // 檢查每行數據的長度
    orders.forEach((order) => {
      const cellLength = String(order[header]).length;
      if (cellLength > maxWidth) {
        maxWidth = cellLength;
      }
    });

    return maxWidth;
  });

  // 生成表頭行
  const headerRow = headers
    .map((header, index) => header.padEnd(columnWidths[index] + 2))
    .join("");

  // 生成分隔行
  const separatorRow = headers
    .map((_, index) => "-".repeat(columnWidths[index] + 2))
    .join("");

  // 生成數據行
  const dataRows = orders.map((order) => {
    return headers
      .map((header, index) =>
        String(order[header]).padEnd(columnWidths[index] + 2)
      )
      .join("");
  });

  // 合併所有行
  return [headerRow, separatorRow, ...dataRows].join("\n");
}

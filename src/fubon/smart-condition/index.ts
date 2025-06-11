import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FubonSDK } from "fubon-neo";
import { Account } from "fubon-neo/trade";

// Import all smart condition tool registration functions
import { registerSingleConditionTool } from "./single-condition.js";
import { registerMultiConditionTool } from "./multi-condition.js";
import { registerCancelConditionTool } from "./cancel-condition.js";
import { registerGetConditionByIdTool } from "./get-condition-by-id.js";
import { registerGetConditionOrderTool } from "./get-condition-order.js";
import { registerGetConditionHistoryTool } from "./get-condition-history.js";
import { registerTimeSliceOrderTool } from "./time-slice-order.js";
import { registerGetTimeSliceOrderTool } from "./get-time-slice-order.js";
import { registerTrailProfitTool } from "./trail-profit.js";
import { registerGetTrailOrderTool } from "./get-trail-order.js";
import { registerGetTrailHistoryTool } from "./get-trail-history.js";

/**
 * Register all smart condition tools to MCP Server
 * @param {Object} server MCP Server 實例
 * @param {Object} sdk FubonSDK 實例
 * @param {Object} account 帳戶實例
 */
export function registerSmartConditionTools(
  server: McpServer,
  sdk: FubonSDK,
  account: Account
) {
  // Register condition creation tools
  registerSingleConditionTool(server, sdk, account);
  registerMultiConditionTool(server, sdk, account);
  
  // Register condition management tools
  registerCancelConditionTool(server, sdk, account);
  registerGetConditionByIdTool(server, sdk, account);
  registerGetConditionOrderTool(server, sdk, account);
  registerGetConditionHistoryTool(server, sdk, account);
  
  // Register time slice order tools
  // registerTimeSliceOrderTool(server, sdk, account);
  // registerGetTimeSliceOrderTool(server, sdk, account);
  
  // Register trail profit tools
  registerTrailProfitTool(server, sdk, account);
  registerGetTrailOrderTool(server, sdk, account);
  registerGetTrailHistoryTool(server, sdk, account);
}
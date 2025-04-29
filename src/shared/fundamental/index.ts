import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FugleApiProvider } from "./providers";
import { registerRecentPriceVolumeTool } from "./tools/get-recent-price-volume";
import { registerStockBasicInfoTool } from "./tools/get-stock-basic-info";
import { registerImportantDatesTool } from "./tools/get-important-dates";
import { registerImportantNewsTool } from "./tools/get-important-news";
import { registerCompanyProfileTool } from "./tools/get-company-profile";
import { registerMonthlyRevenueTool } from "./tools/get-monthly-revenue";
import { registerAutocompleteTool } from "./tools/get-autocomplete-terms";

export const registerAllFundamentalTools = (
  server: McpServer,
  provider: FugleApiProvider
) => {
  registerRecentPriceVolumeTool(server, provider);
  registerStockBasicInfoTool(server, provider);
  registerImportantDatesTool(server, provider);
  registerImportantNewsTool(server, provider);
  registerCompanyProfileTool(server, provider);
  registerMonthlyRevenueTool(server, provider);
  registerAutocompleteTool(server, provider);
};

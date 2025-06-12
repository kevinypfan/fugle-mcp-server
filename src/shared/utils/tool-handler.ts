import { loadToolMetadata, formatApiResponse } from "./tool-metadata.js";

/**
 * Tool handler options
 */
export interface ToolHandlerOptions {
  errorMessage?: string;
  customErrorHandler?: (error: any) => any;
  customFormatter?: (result: any, reference?: any) => string;
}

/**
 * Create a standardized tool handler that provides unified error handling and response formatting
 * @param modulePath The directory path where descriptions and references are located
 * @param filename The filename (without extension) for loading metadata
 * @param apiCall The API call function to execute
 * @param options Optional configuration for error handling and formatting
 * @returns A tool handler function compatible with MCP server
 */
export function createToolHandler<TParams, TResult>(
  modulePath: string,
  filename: string,
  apiCall: (params: TParams) => Promise<TResult>,
  options?: ToolHandlerOptions
) {
  const { reference } = loadToolMetadata(modulePath, filename, '');
  
  return async (params: TParams): Promise<any> => {
    try {
      console.debug(`Executing tool ${filename} with params:`, params);
      const result = await apiCall(params);
      console.debug(`Tool ${filename} executed successfully:`, result);
      
      const response = options?.customFormatter 
        ? options.customFormatter(result, reference)
        : formatApiResponse(result, reference);
        
      return {
        content: [{ type: "text", text: response }],
      };
    } catch (error) {
      console.error(`Tool ${filename} error:`, error);
      
      if (options?.customErrorHandler) {
        return options.customErrorHandler(error);
      }
      
      const errorMessage = options?.errorMessage || "操作時發生錯誤";
      return {
        content: [
          {
            type: "text",
            text: `${errorMessage}: ${error || "未知錯誤"}`,
          },
        ],
        isError: true,
      };
    }
  };
}
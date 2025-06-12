import fs from "fs";
import path from "path";

/**
 * Tool metadata interface
 */
export interface ToolMetadata {
  description: string;
  reference?: any;
}

/**
 * Helper function to load description and reference data for tools
 * @param modulePath The directory path where descriptions and references are located
 * @param filename The filename (without extension) to look for
 * @param baseDescription The base description to use if no markdown file is found
 * @returns The tool metadata containing description and optional reference
 */
export function loadToolMetadata(
  modulePath: string,
  filename: string, 
  baseDescription: string
): ToolMetadata {
  // Load description (optional)
  let description = baseDescription;
  try {
    const markdownPath = path.join(modulePath, 'descriptions', `${filename}.md`);
    if (fs.existsSync(markdownPath)) {
      const explainMarkdown = fs.readFileSync(markdownPath, 'utf-8');
      description = `${baseDescription}\n${explainMarkdown}`;
    }
  } catch (error) {
    // Ignore error, use base description
    console.debug(`Could not load description for ${filename}.md:`, error);
  }

  // Load reference data (optional)
  let reference = null;
  try {
    const referencePath = path.join(modulePath, 'references', `${filename}.json`);
    if (fs.existsSync(referencePath)) {
      reference = JSON.parse(fs.readFileSync(referencePath, 'utf-8'));
    }
  } catch (error) {
    // Ignore error, no reference data
    console.debug(`Could not load reference for ${filename}.json:`, error);
  }

  return { description, reference };
}

/**
 * Helper function to format API response with optional reference data
 * @param result The API response data
 * @param reference Optional reference data for field descriptions
 * @returns Formatted response string
 */
export function formatApiResponse(result: any, reference?: any): string {
  let response = `API Response\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
  
  if (reference) {
    response += `\n\nField Description\n\`\`\`json\n${JSON.stringify(reference, null, 2)}\n\`\`\``;
  }
  
  return response;
}
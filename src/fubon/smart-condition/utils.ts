import fs from "fs";
import path from "path";

/**
 * Helper function to load markdown description for smart condition tools
 * @param filename The markdown filename (without .md extension)
 * @param baseDescription The base description to prepend
 * @returns The combined description with markdown content
 */
export function loadToolDescription(filename: string, baseDescription: string): string {
  try {
    const markdownPath = path.join(__dirname, 'descriptions', `${filename}.md`);
    const explainMarkdown = fs.readFileSync(markdownPath, 'utf-8');
    return `${baseDescription}\n${explainMarkdown}`;
  } catch (error) {
    console.warn(`Warning: Could not load description for ${filename}.md:`, error);
    return baseDescription;
  }
}
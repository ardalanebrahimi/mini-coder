import { Injectable } from "@angular/core";

/**
 * Service for minifying HTML/CSS/JS code to reduce token usage in AI prompts
 */
@Injectable({
  providedIn: "root",
})
export class CodeMinifierService {
  constructor() {}

  /**
   * Minify HTML code by removing unnecessary whitespace, comments, and formatting
   * Uses a simple regex-based approach suitable for browser environment
   * @param htmlCode - The HTML code to minify
   * @returns Minified HTML code
   */
  minifyHtml(htmlCode: string): string {
    if (!htmlCode?.trim()) {
      return htmlCode;
    }

    try {
      let minified = htmlCode
        // Remove HTML comments (except conditional comments)
        .replace(/<!--(?!\s*(?:\[if [^\]]+\]|<!|>))[\s\S]*?-->/g, "")
        // Remove excessive whitespace between tags
        .replace(/>\s+</g, "><")
        // Remove whitespace at the beginning of lines
        .replace(/^\s+/gm, "")
        // Remove whitespace at the end of lines
        .replace(/\s+$/gm, "")
        // Remove empty lines
        .replace(/\n\s*\n/g, "\n")
        // Minimize whitespace in CSS (between style tags)
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
          return match.replace(css, this.minifyCss(css));
        })
        // Minimize whitespace in JavaScript (between script tags)
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
          return match.replace(js, this.minifyJs(js));
        })
        // Remove extra spaces around attributes
        .replace(/\s+=/g, "=")
        .replace(/=\s+/g, "=")
        // Remove quotes from simple attribute values (only if safe)
        .replace(/=["']([a-zA-Z0-9-_]+)["']/g, "=$1")
        // Final cleanup - remove any remaining excessive whitespace
        .replace(/\s{2,}/g, " ")
        .trim();

      return minified;
    } catch (error) {
      console.warn("Error minifying HTML, returning original:", error);
      return htmlCode;
    }
  }

  /**
   * Minify CSS code by removing whitespace and comments
   * @param cssCode - The CSS code to minify
   * @returns Minified CSS code
   */
  private minifyCss(cssCode: string): string {
    return (
      cssCode
        // Remove CSS comments
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Remove whitespace around selectors and properties
        .replace(/\s*{\s*/g, "{")
        .replace(/;\s*/g, ";")
        .replace(/\s*}\s*/g, "}")
        .replace(/:\s*/g, ":")
        .replace(/,\s*/g, ",")
        // Remove unnecessary semicolons
        .replace(/;}/g, "}")
        // Remove extra whitespace
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  /**
   * Minify JavaScript code by removing whitespace and comments
   * Note: This is a simple minifier. For complex JS, consider using a proper minifier.
   * @param jsCode - The JavaScript code to minify
   * @returns Minified JavaScript code
   */
  private minifyJs(jsCode: string): string {
    return (
      jsCode
        // Remove single-line comments (but be careful with URLs)
        .replace(/\/\/.*$/gm, "")
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Remove extra whitespace
        .replace(/\s+/g, " ")
        // Remove whitespace around operators (be careful with certain cases)
        .replace(/\s*([=+\-*/{}();,:])\s*/g, "$1")
        // Remove unnecessary semicolons
        .replace(/;}/g, "}")
        .trim()
    );
  }

  /**
   * Get size reduction percentage
   * @param original - Original code
   * @param minified - Minified code
   * @returns Reduction percentage as a string
   */
  getSizeReduction(original: string, minified: string): string {
    const originalSize = original.length;
    const minifiedSize = minified.length;
    const reduction = ((originalSize - minifiedSize) / originalSize) * 100;
    return reduction.toFixed(1) + "%";
  }

  /**
   * Check if minification would be beneficial (size reduction > 10%)
   * @param original - Original code
   * @param minified - Minified code
   * @returns True if minification provides significant benefit
   */
  isMinificationBeneficial(original: string, minified: string): boolean {
    const originalSize = original.length;
    const minifiedSize = minified.length;
    const reduction = ((originalSize - minifiedSize) / originalSize) * 100;
    return reduction > 10;
  }
}

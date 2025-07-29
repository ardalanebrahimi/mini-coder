import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ProcessedCommand } from "./prompt-processor.service";

@Injectable({
  providedIn: "root",
})
export class TestPreviewService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Generate a test static preview with calculator app
   */
  generateTestPreview(): ProcessedCommand {
    const testHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Calculator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            margin-bottom: 20px;
            font-size: 2em;
        }
        .calculator {
            background: rgba(0, 0, 0, 0.8);
            padding: 20px;
            border-radius: 10px;
            margin: 20px auto;
            max-width: 300px;
        }
        .display {
            background: #333;
            color: #0ff;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 5px;
            font-size: 1.5em;
            text-align: right;
            min-height: 30px;
        }
        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }
        button {
            padding: 20px;
            font-size: 1.2em;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #555;
            color: white;
        }
        button:hover {
            background: #666;
            transform: scale(1.05);
        }
        .operator {
            background: #ff6b6b !important;
        }
        .operator:hover {
            background: #ff5252 !important;
        }
        .equals {
            background: #4CAF50 !important;
        }
        .equals:hover {
            background: #45a049 !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧮 Test Calculator</h1>
        <div class="calculator">
            <div class="display" id="display">0</div>
            <div class="buttons">
                <button onclick="clearDisplay()">C</button>
                <button onclick="appendToDisplay('/')" class="operator">÷</button>
                <button onclick="appendToDisplay('*')" class="operator">×</button>
                <button onclick="backspace()">⌫</button>
                
                <button onclick="appendToDisplay('7')">7</button>
                <button onclick="appendToDisplay('8')">8</button>
                <button onclick="appendToDisplay('9')">9</button>
                <button onclick="appendToDisplay('-')" class="operator">-</button>
                
                <button onclick="appendToDisplay('4')">4</button>
                <button onclick="appendToDisplay('5')">5</button>
                <button onclick="appendToDisplay('6')">6</button>
                <button onclick="appendToDisplay('+')" class="operator">+</button>
                
                <button onclick="appendToDisplay('1')">1</button>
                <button onclick="appendToDisplay('2')">2</button>
                <button onclick="appendToDisplay('3')">3</button>
                <button onclick="calculate()" class="equals">=</button>
                
                <button onclick="appendToDisplay('0')" style="grid-column: span 2;">0</button>
                <button onclick="appendToDisplay('.')">.</button>
                <button onclick="testAlert()" style="grid-column: span 1; background: #9c27b0;">Test</button>
            </div>
        </div>
    </div>

    <script>
        let display = document.getElementById('display');
        let currentInput = '0';

        function updateDisplay() {
            display.textContent = currentInput;
        }

        function appendToDisplay(value) {
            if (currentInput === '0' && value !== '.') {
                currentInput = value;
            } else {
                currentInput += value;
            }
            updateDisplay();
        }

        function clearDisplay() {
            currentInput = '0';
            updateDisplay();
        }

        function backspace() {
            if (currentInput.length > 1) {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = '0';
            }
            updateDisplay();
        }

        function calculate() {
            try {
                let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
                let result = eval(expression);
                currentInput = result.toString();
                updateDisplay();
            } catch (error) {
                currentInput = 'Error';
                updateDisplay();
                setTimeout(() => {
                    clearDisplay();
                }, 1500);
            }
        }

        function testAlert() {
            alert('Calculator is working! Preview iframe is functional.');
        }

        // Add keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            
            if (key >= '0' && key <= '9') {
                appendToDisplay(key);
            } else if (key === '.') {
                appendToDisplay('.');
            } else if (key === '+' || key === '-') {
                appendToDisplay(key);
            } else if (key === '*') {
                appendToDisplay('*');
            } else if (key === '/') {
                event.preventDefault();
                appendToDisplay('/');
            } else if (key === 'Backspace') {
                backspace();
            } else if (key === 'Enter' || key === '=') {
                calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                clearDisplay();
            }
        });

    </script>
</body>
</html>`;

    // Create a ProcessedCommand for testing
    const testResult: ProcessedCommand = {
      detectedLanguage: "en",
      generatedCode: testHtml,
      sanitizedCode: this.sanitizer.bypassSecurityTrustHtml(testHtml),
      projectName: "Test Calculator",
    };

    return testResult;
  }

  /**
   * Generate test blob URL HTML for testing blob URL functionality
   */
  generateBlobTestPreview(): ProcessedCommand {
    const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Blob URL Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        button {
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            cursor: pointer;
            margin: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Blob URL Test</h1>
        <p>This is a test to verify blob URL creation is working.</p>
        <button onclick="alert('Blob URL test successful!')">Test Alert</button>
    </div>
    <script>
    </script>
</body>
</html>`;

    const testResult: ProcessedCommand = {
      detectedLanguage: "en",
      generatedCode: testHtml,
      sanitizedCode: this.sanitizer.bypassSecurityTrustHtml(testHtml),
      projectName: "Blob URL Test",
    };

    return testResult;
  }

  /**
   * Get data URL for iframe to bypass sanitization
   */
  getDataUrl(html: string): string {
    if (!html) {
      console.warn("No HTML provided to getDataUrl");
      return "";
    }
    try {
      // Encode the HTML as a data URL
      const encodedHtml = encodeURIComponent(html);
      const dataUrl = `data:text/html;charset=utf-8,${encodedHtml}`;
      return dataUrl;
    } catch (error) {
      console.error("Error creating data URL:", error);
      return "";
    }
  }

  /**
   * Create blob URL for iframe to bypass sanitization
   */
  createBlobUrl(html: string, previousBlobUrl?: string): string {
    if (!html) {
      console.warn("No HTML provided to createBlobUrl");
      return "";
    }

    // Revoke previous blob URL to prevent memory leaks
    if (previousBlobUrl) {
      URL.revokeObjectURL(previousBlobUrl);
    }

    try {
      // Create blob with HTML content
      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      return blobUrl;
    } catch (error) {
      console.error("Error creating blob URL:", error);
      return "";
    }
  }
}

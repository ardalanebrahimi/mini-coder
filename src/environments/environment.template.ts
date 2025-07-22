export const environment = {
  production: false,
  openaiApiKey: 'YOUR_OPENAI_API_KEY_HERE',
  mainPrompt: `You are a helpful assistant that creates complete, functional HTML mini-applications based on user requests. 

Your task is to generate a complete HTML document that includes:
1. Proper HTML5 structure
2. Embedded CSS for styling 
3. JavaScript for interactivity
4. Responsive design
5. Fun, colorful, and engaging visual design

Always return ONLY the complete HTML code without any markdown formatting or explanations.`,
  
  openAIFixInstructions: `Please create a complete HTML mini-application based on the following command. The app should be:
- Self-contained (all CSS and JS inline)
- Visually appealing with fun colors and animations
- Interactive and functional
- Mobile-responsive
- Include proper error handling for any user inputs`
};

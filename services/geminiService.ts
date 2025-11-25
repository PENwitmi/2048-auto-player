import { GoogleGenAI } from '@google/genai';
import { Grid, TileValue } from '../types';

export const getGeminiAdvice = async (grid: Grid): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Format grid for textual representation
    const gridText = grid.map(row => 
      row.map(tile => tile ? tile.value : 0).join('\t')
    ).join('\n');

    const prompt = `
You are a grandmaster at the game 2048. Analyze the current board state below.
Zeros represent empty cells.

${gridText}

Task:
1. Recommend the single best move (Up, Down, Left, or Right).
2. Briefly explain the strategic reasoning (e.g., keeping the largest tile in the corner, merging specific blocks, setting up a chain).
3. Keep the advice concise (under 50 words) and encouraging.

Response Format:
Move: [Direction]
Reason: [Explanation]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't generate advice right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the strategy mainframe.";
  }
};

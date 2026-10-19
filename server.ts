/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // API Routes
  app.post('/api/recognize-fridge', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: 'Analyze this refrigerator or food ingredients image. Identify all visible ingredients, estimate their quantity and unit (e.g., 4 pieces, half head, 500g), and categorize them (e.g., 蔬菜, 肉蛋海鮮, 乳製品, 調味料, 水果, 其他). Return structured JSON matching the requested schema in Traditional Chinese.',
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Ingredient name in Traditional Chinese' },
                quantity: { type: Type.NUMBER, description: 'Estimated quantity number' },
                unit: { type: Type.STRING, description: 'Unit such as 顆, 個, 包, g, ml, 半顆' },
                category: { type: Type.STRING, description: 'Category: 蔬菜, 肉蛋海鮮, 乳製品, 調味料, 水果, 其他' },
              },
              required: ['name', 'quantity', 'unit', 'category'],
            },
          },
        },
      });

      const ingredients = JSON.parse(response.text || '[]');
      res.json({ ingredients });
    } catch (err: any) {
      console.error('Error recognizing fridge:', err);
      res.status(500).json({ error: err.message || 'Failed to recognize fridge image' });
    }
  });

  app.post('/api/generate-recipes', async (req, res) => {
    try {
      const { ingredients, preferences, appliances, timeLimit } = req.body;
      
      const prompt = `Based on the following available fridge ingredients:
${JSON.stringify(ingredients)}

User Dietary Preferences: ${preferences?.join(', ') || 'None'}
Available Appliances: ${appliances?.join(', ') || 'Gas stove, microwave'}
Time Limit: ${timeLimit || '30 minutes'}

Generate 3 creative, delicious, and easy-to-follow recipes in Traditional Chinese using as many of these ingredients as possible. Return structured JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING, description: 'Recipe title in Traditional Chinese' },
                description: { type: Type.STRING, description: 'Appetizing short description' },
                prepTimeMinutes: { type: Type.NUMBER, description: 'Preparation and cooking time in minutes' },
                difficulty: { type: Type.STRING, description: '簡單, 中等, 挑戰' },
                appliancesUsed: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Appliances used like 電鍋, 氣炸鍋, 微波爐, 單口瓦斯爐, 烤箱',
                },
                matchingIngredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.STRING },
                    },
                    required: ['name', 'amount'],
                  },
                },
                missingIngredients: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Optional missing ingredients that would enhance the dish',
                },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Step by step cooking instructions in Traditional Chinese',
                },
                nutritionTips: { type: Type.STRING, description: 'Nutritional highlights' },
              },
              required: [
                'id',
                'title',
                'description',
                'prepTimeMinutes',
                'difficulty',
                'appliancesUsed',
                'matchingIngredients',
                'missingIngredients',
                'steps',
                'nutritionTips',
              ],
            },
          },
        },
      });

      const recipes = JSON.parse(response.text || '[]');
      res.json({ recipes });
    } catch (err: any) {
      console.error('Error generating recipes:', err);
      res.status(500).json({ error: err.message || 'Failed to generate recipes' });
    }
  });

  app.post('/api/substitute-recipe', async (req, res) => {
    try {
      const { currentRecipe, ingredients, instruction } = req.body;

      const prompt = `Current Recipe: ${JSON.stringify(currentRecipe)}
Available Fridge Ingredients: ${JSON.stringify(ingredients)}
User Substitution Instruction: "${instruction}"

Generate a new alternative recipe in Traditional Chinese that addresses the user's instruction while utilizing available ingredients. Return structured JSON matching the recipe schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              prepTimeMinutes: { type: Type.NUMBER },
              difficulty: { type: Type.STRING },
              appliancesUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchingIngredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING },
                  },
                  required: ['name', 'amount'],
                },
              },
              missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              nutritionTips: { type: Type.STRING },
            },
            required: [
              'id',
              'title',
              'description',
              'prepTimeMinutes',
              'difficulty',
              'appliancesUsed',
              'matchingIngredients',
              'missingIngredients',
              'steps',
              'nutritionTips',
            ],
          },
        },
      });

      const recipe = JSON.parse(response.text || '{}');
      res.json({ recipe });
    } catch (err: any) {
      console.error('Error substituting recipe:', err);
      res.status(500).json({ error: err.message || 'Failed to substitute recipe' });
    }
  });

  // Vite middleware for dev
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();

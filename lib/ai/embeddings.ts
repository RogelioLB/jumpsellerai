import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import fs from 'fs/promises';
import path from 'path';
async function loadEmbeddings(path: string) {
    console.log("Loading embeddings from", path);
    try {
      const raw = await fs.readFile(path, 'utf-8');
      return JSON.parse(raw) as { text: string; vector: number[] }[];
    } catch (err) {
      console.error("Error loading embeddings:", err);
      return [];
    }
  }
  

function cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
    return dot / (normA * normB);
  }
  

async function embedQuery(query: string) {
  const {embedding} = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });
  return embedding;
}

export async function retrieveContext(query: string) {
    const embeddings = await loadEmbeddings(path.resolve("./lib/ai/embeddings.json"));
    const queryEmbedding = await embedQuery(query);
    const scored = embeddings.map(e => ({
      ...e,
      score: cosineSimilarity(queryEmbedding, e.vector),
    }));
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)  // los 3 más relevantes
      .map(e => e.text)
      .join('\n');
  }
  

import type { NextApiRequest, NextApiResponse } from 'next';
import { chunkText, generateEmbeddings, estimateTokens, estimateEmbeddingCost } from '@/lib/embeddings';
import { upsertDocuments } from '@/lib/vectorStore';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, source, title } = req.body;

    if (!text || !source) {
      return res.status(400).json({ error: 'Text and source are required' });
    }

    const startTime = Date.now();

    // Step 1: Chunk the text
    const chunks = chunkText(text, source, title);

    if (chunks.length === 0) {
      return res.status(400).json({ error: 'No valid chunks created from text' });
    }

    // Step 2: Generate embeddings
    const embeddings = await generateEmbeddings(chunks.map(c => c.content));

    // Step 3: Prepare documents for upsert
    const documents = chunks.map((chunk, idx) => ({
      content: chunk.content,
      embedding: embeddings[idx],
      metadata: chunk.metadata,
    }));

    // Step 4: Upsert to vector database
    await upsertDocuments(documents);

    const totalTime = Date.now() - startTime;

    // Calculate stats
    const totalTokens = chunks.reduce((sum, chunk) => sum + estimateTokens(chunk.content), 0);
    const cost = estimateEmbeddingCost(totalTokens);

    res.status(200).json({
      success: true,
      stats: {
        chunksCreated: chunks.length,
        totalTokens,
        estimatedCost: cost,
        processingTime: totalTime,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process document' });
  }
}

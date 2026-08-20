import { NextResponse } from 'next/server';
import { ollamaService } from '@/lib/services/ollama.service';

export async function GET() {
  const ollamaStatus = await ollamaService.getStatus();
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);

  return NextResponse.json({
    success: true,
    data: {
      ollama: {
        isAvailable: ollamaStatus.isAvailable,
        baseUrl: ollamaStatus.baseUrl,
        currentModel: ollamaStatus.currentModel,
        availableModels: ollamaStatus.availableModels,
        latencyMs: ollamaStatus.latencyMs,
        isDownloading: ollamaStatus.isAvailable && ollamaStatus.availableModels.length === 0,
      },
      gemini: {
        isAvailable: hasGeminiKey,
        model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      },
      timestamp: new Date().toISOString(),
    },
  });
}

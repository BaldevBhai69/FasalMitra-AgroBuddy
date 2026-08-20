import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { DiseaseDiagnoseSchema } from '@/lib/validations/ai-chat.schema';
import { diseaseService } from '@/lib/services/disease.service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    // Rate limit: 15 image diagnoses per minute
    const { allowed } = rateLimiter.checkLimit(`ai-diagnose-${ip}`, 15, 60000);
    if (!allowed) {
      throw ApiError.rateLimit('Image diagnosis rate limit exceeded. Please wait a moment.');
    }

    const body = await request.json();
    const validated = DiseaseDiagnoseSchema.parse(body);

    const diagnosisResult = await diseaseService.diagnoseImage(
      validated.imageBase64,
      validated.mimeType,
      validated.cropName,
      validated.symptomsDescription,
      validated.language
    );

    return NextResponse.json({
      success: true,
      data: diagnosisResult,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

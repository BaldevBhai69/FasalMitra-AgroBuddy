import { handleApiError } from '@/lib/utils/error-handler';
import { ApiError } from '@/lib/utils/api-error';
import { verifyCronAuthorization } from '@/lib/utils/security';
import { mandiService } from '@/lib/services/mandi.service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const isAuthorized = verifyCronAuthorization(request);
    if (!isAuthorized) {
      throw ApiError.unauthorized('Invalid or missing CRON_SECRET authorization header');
    }

    const result = await mandiService.ingestFromDataGovIn();

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        job: 'daily_mandi_ingestion',
      },
    });
  } catch (error) {
    return handleApiError(error, request);
  }
}

// Support GET for manual testing or Vercel cron invocation
export async function GET(request: Request) {
  return POST(request);
}

class MemoryRateLimiter {
  private requests = new Map<string, number[]>();

  public checkLimit(identifier: string, maxRequests: number = 60, windowMs: number = 60000): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];

    // Filter out expired timestamps
    const activeTimestamps = timestamps.filter((time) => now - time < windowMs);

    if (activeTimestamps.length >= maxRequests) {
      const oldest = activeTimestamps[0];
      const resetMs = Math.max(0, windowMs - (now - oldest));
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    activeTimestamps.push(now);
    this.requests.set(identifier, activeTimestamps);

    // Garbage collection if map grows large
    if (this.requests.size > 5000) {
      for (const [key, times] of this.requests.entries()) {
        if (times.every((t) => now - t >= windowMs)) {
          this.requests.delete(key);
        }
      }
    }

    return {
      allowed: true,
      remaining: maxRequests - activeTimestamps.length,
      resetMs: windowMs,
    };
  }
}

export const rateLimiter = new MemoryRateLimiter();

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

import { describe, expect, it } from 'vitest';
import { proxyConfig } from '@/lib/proxy-config';

describe('proxy config', () => {
  it('protects portal paths', () => {
    expect(proxyConfig.matcher).toContain('/portal/:path*');
  });

  it('covers auth endpoints for login rate limiting', () => {
    expect(proxyConfig.matcher).toContain('/api/auth/:path*');
  });
});

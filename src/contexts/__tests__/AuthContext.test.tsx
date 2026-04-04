import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';
import { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// Helper to mock a Supabase session with RPC profile
function mockSessionWithRole(role: 'admin' | 'client' | 'technician', userId = 'user-123') {
  vi.mocked(supabase.auth.getSession).mockResolvedValue({
    data: {
      session: {
        user: { id: userId, email: 'test@locagame.net' },
      } as any,
    },
    error: null,
  } as any);

  vi.mocked(supabase.rpc).mockResolvedValue({
    data: [{
      role,
      profile_id: userId,
      email: 'test@locagame.net',
      first_name: 'Jean',
      last_name: 'Dupont',
      phone: '0600000000',
    }],
    error: null,
  } as any);

  // For client role, also mock company_name query
  if (role === 'client') {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { company_name: 'ACME' }, error: null }),
    };
    vi.mocked(supabase.from).mockReturnValue(mockChain as any);
  }
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no session
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    } as any);
  });

  it('starts with loading=true, user=null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('loads user with admin role from persistent session', async () => {
    mockSessionWithRole('admin');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).not.toBeNull();
    expect(result.current.user!.role).toBe('admin');
    expect(result.current.user!.firstName).toBe('Jean');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('loads user with client role correctly', async () => {
    mockSessionWithRole('client');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user!.role).toBe('client');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('hasRole() detects admin correctly', async () => {
    mockSessionWithRole('admin');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('client')).toBe(false);
    expect(result.current.hasRole('technician')).toBe(false);
  });

  it('hasRole() detects client correctly', async () => {
    mockSessionWithRole('client');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasRole('client')).toBe(true);
    expect(result.current.hasRole('admin')).toBe(false);
  });

  it('signOut() resets state', async () => {
    mockSessionWithRole('admin');
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('no session = not authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

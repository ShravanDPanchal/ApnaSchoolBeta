'use client';

import React from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#f8f9fa]">{children}</main>;
}

'use client';

import { ReactNode } from 'react';

interface InstantDBProviderProps {
  children: ReactNode;
}

// InstantDB doesn't require a provider in this version
export default function InstantDBProvider({ children }: InstantDBProviderProps) {
  return <>{children}</>;
}
// ─── Scroll context ───────────────────────────────────────────────────────────

import { createContext } from 'react';
import type { ScrollContextValue } from '../types';

export const ScrollContext = createContext<ScrollContextValue | null>(null);

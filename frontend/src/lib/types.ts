import type { Color } from '@immich/ui';

export type HeaderItem = {
  title: string;
  href: string;
  color?: Color;
  variant?: 'outline' | 'ghost' | 'filled';
  icon?: string;
  external?: boolean;
};

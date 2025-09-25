import type { Color, IconLike } from '@immich/ui';

export type HeaderItem = {
  title: string;
  href: string;
  color?: Color;
  variant?: 'outline' | 'ghost' | 'filled';
  icon?: IconLike;
};

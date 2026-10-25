'use client';

import React from 'react';
import {
  Briefcase,
  Heart,
  ShoppingCart,
  Activity,
  BookOpen,
  CreditCard,
  Smile,
  Sun,
  Star,
  Zap,
  Coffee,
  Plane,
  Home,
  Music,
  Film,
  Laptop,
  DollarSign,
  Target,
  Gift,
  Bell,
  Compass,
  Tag,
  CheckCircle2,
  Folder,
  Layers,
  LucideIcon
} from 'lucide-react';

export const CATEGORY_ICONS: { [key: string]: LucideIcon } = {
  Briefcase,
  Heart,
  ShoppingCart,
  Activity,
  BookOpen,
  CreditCard,
  Smile,
  Sun,
  Star,
  Zap,
  Coffee,
  Plane,
  Home,
  Music,
  Film,
  Laptop,
  DollarSign,
  Target,
  Gift,
  Bell,
  Compass,
  Folder,
  Layers,
  Tag,
  CheckCircle2,
};

export const AVAILABLE_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

interface CategoryIconProps {
  name?: string;
  className?: string;
  color?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = 'Tag',
  className = 'w-4 h-4',
  color,
  size,
}) => {
  const IconComponent = CATEGORY_ICONS[name] || Tag;
  return (
    <IconComponent 
      className={className} 
      style={color ? { color } : undefined} 
      size={size} 
    />
  );
};

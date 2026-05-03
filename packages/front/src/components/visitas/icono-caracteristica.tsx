import {
  Dumbbell, PersonStanding, Move, ArrowUp, ArrowDown,
  Scale, Ruler, Zap, Flame, Wind, Minus, Plus, Circle, Square, Triangle,
  User, UserRound, Baby, Users, Heart, Crown, GraduationCap, Glasses, Watch,
  Scissors, Waves, AlignCenter, AlignLeft, AlignRight, Feather, Leaf, Sparkles, Sun, Moon,
  ShoppingBag, Backpack, Briefcase, Shirt, Gem, Award, Medal, Trophy, Star,
  Smile, Frown, Meh, Laugh, Angry, ThumbsUp, ThumbsDown, HandMetal, Hand, Handshake,
  Car, Bike, Bus, Coffee, Utensils, Phone, Camera, Music, Headphones, BookOpen,
  Tag, Flag, Bookmark, MapPin, Navigation, Globe, Home, Building, Store, ShoppingCart,
  type LucideIcon, type LucideProps,
} from 'lucide-react';

export const ICONOS_POR_CATEGORIA: Record<string, string[]> = {
  'Físico': [
    'Dumbbell', 'PersonStanding', 'Move', 'ArrowUp', 'ArrowDown',
    'Scale', 'Ruler', 'Zap', 'Flame', 'Wind',
    'Minus', 'Plus', 'Circle', 'Square', 'Triangle',
  ],
  'Género / Edad': [
    'User', 'UserRound', 'Baby', 'Users', 'Heart',
    'Crown', 'GraduationCap', 'Glasses', 'Watch', 'Gem',
  ],
  'Cabello': [
    'Scissors', 'Waves', 'AlignCenter', 'AlignLeft', 'AlignRight',
    'Feather', 'Leaf', 'Sparkles', 'Sun', 'Moon',
  ],
  'Vestimenta': [
    'ShoppingBag', 'Backpack', 'Briefcase', 'Shirt', 'Watch',
    'Gem', 'Award', 'Medal', 'Trophy', 'Star',
  ],
  'Actitud': [
    'Smile', 'Frown', 'Meh', 'Laugh', 'Angry',
    'ThumbsUp', 'ThumbsDown', 'HandMetal', 'Hand', 'Handshake',
  ],
  'Actividad': [
    'Car', 'Bike', 'Bus', 'Coffee', 'Utensils',
    'Phone', 'Camera', 'Music', 'Headphones', 'BookOpen',
  ],
  'Misceláneo': [
    'Tag', 'Flag', 'Bookmark', 'MapPin', 'Navigation',
    'Globe', 'Home', 'Building', 'Store', 'ShoppingCart',
  ],
};

const ICON_MAP: Record<string, LucideIcon> = {
  Dumbbell, PersonStanding, Move, ArrowUp, ArrowDown,
  Scale, Ruler, Zap, Flame, Wind, Minus, Plus, Circle, Square, Triangle,
  User, UserRound, Baby, Users, Heart, Crown, GraduationCap, Glasses, Watch,
  Scissors, Waves, AlignCenter, AlignLeft, AlignRight, Feather, Leaf, Sparkles, Sun, Moon,
  ShoppingBag, Backpack, Briefcase, Shirt, Gem, Award, Medal, Trophy, Star,
  Smile, Frown, Meh, Laugh, Angry, ThumbsUp, ThumbsDown, HandMetal, Hand, Handshake,
  Car, Bike, Bus, Coffee, Utensils, Phone, Camera, Music, Headphones, BookOpen,
  Tag, Flag, Bookmark, MapPin, Navigation, Globe, Home, Building, Store, ShoppingCart,
};

/** Renderiza un ícono Lucide por nombre. Fallback a Circle si no existe. */
export function IconoCaracteristica({ nombre, ...props }: { nombre: string } & LucideProps) {
  const Icono = ICON_MAP[nombre] ?? Circle;
  return <Icono {...props} />;
}

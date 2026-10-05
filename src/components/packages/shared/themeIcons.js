import {
  Castle,
  Compass,
  Heart,
  Landmark,
  Mountain,
  Palmtree,
  Binoculars,
  Building2,
  Users,
  Sparkles,
} from "lucide-react";

export const THEME_ICONS = {
  mountains: Mountain,
  beaches: Palmtree,
  heritage: Castle,
  spiritual: Landmark,
  wildlife: Binoculars,
  honeymoon: Heart,
  adventure: Compass,
  city: Building2,
  family: Users,
};

export function getThemeIcon(themeId) {
  return THEME_ICONS[themeId] ?? Sparkles;
}

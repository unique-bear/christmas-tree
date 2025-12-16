import { Color } from 'three';

export const COLORS = {
  EMERALD_DEEP: "#001a10",
  EMERALD_LIGHT: "#004d2e",
  GOLD_METALLIC: "#FFD700",
  GOLD_ROSE: "#E0BFB8",
  WHITE_WARM: "#FFFDD0",
  RED_VELVET: "#8a0000"
};

export const CONFIG = {
  PARTICLE_COUNT: 2800,
  ORNAMENT_COUNT: 180,
  TREE_HEIGHT: 14,
  TREE_RADIUS_BASE: 5.5,
  SCATTER_RADIUS: 35,
  ANIMATION_SPEED: 2.0, // Smoother damping
};

export const THREE_COLOR_GOLD = new Color(COLORS.GOLD_METALLIC);
export const THREE_COLOR_EMERALD = new Color(COLORS.EMERALD_LIGHT);
export const THREE_COLOR_ROSE = new Color(COLORS.GOLD_ROSE);
export const THREE_COLOR_RED = new Color(COLORS.RED_VELVET);
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

/**
 * Frame CSS styles mapped by frame key.
 */
export const FRAME_STYLES = {
  blue: { border: '3.5px solid #3b82f6', boxShadow: '0 0 14px rgba(59, 130, 246, 0.5)' },
  green: { border: '3.5px solid #10b981', boxShadow: '0 0 14px rgba(16, 185, 129, 0.5)' },
  gold: { border: '4px solid #f59e0b', boxShadow: '0 0 20px rgba(245, 158, 11, 0.7)' },
  diamond: { border: '4px solid #06b6d4', boxShadow: '0 0 24px rgba(6, 182, 212, 0.8)' },
  fire: { border: '4px solid #ef4444', boxShadow: '0 0 28px rgba(239, 68, 68, 0.9)' },
};

/**
 * Maps frontend clothes key to actual DiceBear avataaars clothing option name.
 */
const CLOTHES_MAP = {
  collegeUniform: 'blazerAndShirt',
  blazerAndShirt: 'blazerAndShirt',
  shirtVNeck: 'shirtVNeck',
  hoodie: 'hoodie',
  overall: 'overall',
  graphicShirt: 'graphicShirt',
};

/**
 * Generate a DiceBear avataaars SVG string based on full avatar configuration.
 */
export function generateAvataaarsSvg(config = {}) {
  const seed = config.seed || 'student';
  const rawHair = config.hair || 'shortFlat';
  const topOption = [rawHair === 'shortHair' ? 'shortFlat' : rawHair];

  const eyesOption = [config.eyes || 'happy'];
  const eyebrowsOption = [config.eyebrows || 'default'];
  const mouthOption = [config.mouth || 'smile'];
  const accessoriesOption = (!config.glasses || config.glasses === 'none') ? [] : [config.glasses];

  const rawClothes = config.clothes || 'collegeUniform';
  const clothesOption = [CLOTHES_MAP[rawClothes] || rawClothes];

  const rawBg = config.background || 'ffffff';
  const bgOption = [rawBg.replace('#', '')];

  try {
    const avatar = createAvatar(avataaars, {
      seed: seed,
      top: topOption,
      eyes: eyesOption,
      eyebrows: eyebrowsOption,
      mouth: mouthOption,
      accessories: accessoriesOption,
      clothing: clothesOption,
      backgroundColor: bgOption,
    });
    return avatar.toString();
  } catch (err) {
    console.error('Error generating avataaars SVG:', err);
    // Fallback avatar
    const fallback = createAvatar(avataaars, { seed: seed, top: ['shortFlat'] });
    return fallback.toString();
  }
}

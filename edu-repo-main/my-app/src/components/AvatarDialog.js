import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  IconButton,
  Skeleton,
  Zoom,
  Fade,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AvatarService from '../services/AvatarService';
import GamificationService from '../services/GamificationService';
import { getUserIdFromToken, getDecodedToken } from '../utils/authHelper';
import AvatarDisplay from './AvatarDisplay';
import { generateAvataaarsSvg } from '../utils/avatarHelper';

const CATEGORIES = [
  { key: 'COMBOS', label: 'Combos', icon: '🎁' },
  { key: 'HAIR', label: 'Hair', icon: '💇' },
  { key: 'EYES', label: 'Eyes', icon: '👁️' },
  { key: 'EYEBROWS', label: 'Eyebrows', icon: '🤨' },
  { key: 'MOUTH', label: 'Mouth', icon: '👄' },
  { key: 'GLASSES', label: 'Glasses', icon: '👓' },
  { key: 'CLOTHES', label: 'Clothes', icon: '👕' },
  { key: 'FRAME', label: 'Frame', icon: '🖼️' },
  { key: 'BACKGROUND', label: 'Background', icon: '🎨' },
];

const PRESET_COMBOS = [
  {
    id: 'combo_1',
    displayName: 'Student Scholar',
    description: 'Classic campus academic look with uniform & glasses',
    icon: '🎓',
    config: {
      hair: 'shortFlat',
      eyes: 'happy',
      eyebrows: 'default',
      mouth: 'smile',
      glasses: 'prescription01',
      clothes: 'blazerAndShirt',
      frame: 'blue',
      background: '60a5fa',
    },
    badge: '🟢 FREE',
    badgeBg: '#dcfce7',
    badgeColor: '#15803d',
  },
  {
    id: 'combo_2',
    displayName: 'Cool Campus Vibe',
    description: 'Trendy casual style with hoodie, shades & purple aura',
    icon: '😎',
    config: {
      hair: 'longButNotTooLong',
      eyes: 'wink',
      eyebrows: 'raisedExcited',
      mouth: 'smile',
      glasses: 'wayfarers',
      clothes: 'hoodie',
      frame: 'green',
      background: 'a78bfa',
    },
    badge: '🟢 FREE',
    badgeBg: '#dcfce7',
    badgeColor: '#15803d',
  },
  {
    id: 'combo_3',
    displayName: 'Graduation Elite',
    description: 'Prestigious scholar gown with golden star frame',
    icon: '🏆',
    config: {
      hair: 'curly',
      eyes: 'happy',
      eyebrows: 'default',
      mouth: 'twinkle',
      glasses: 'round',
      clothes: 'overall',
      frame: 'gold',
      background: '312e81',
    },
    badge: '⭐ Level 5',
    badgeBg: '#fef9c3',
    badgeColor: '#a16207',
  },
  {
    id: 'combo_4',
    displayName: 'Cyber AI Hacker',
    description: 'Futuristic AI hoodie, mohawk, sunglasses & circuit background',
    icon: '🤖',
    config: {
      hair: 'bigHair',
      eyes: 'squint',
      eyebrows: 'angry',
      mouth: 'serious',
      glasses: 'sunglasses',
      clothes: 'graphicShirt',
      frame: 'fire',
      background: '0f172a',
    },
    badge: '🪙 800 Coins',
    badgeBg: '#ffedd5',
    badgeColor: '#c2410c',
  },
];

const STATIC_FALLBACK_ITEMS = {
  HAIR: [
    { id: 101, category: 'HAIR', itemKey: 'shortFlat', displayName: 'Short Hair', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: true, unlocked: true },
    { id: 102, category: 'HAIR', itemKey: 'longButNotTooLong', displayName: 'Long Hair', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: false, unlocked: true },
    { id: 103, category: 'HAIR', itemKey: 'curly', displayName: 'Curly Hair', unlockType: 'LEVEL', requiredLevel: 3, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 3' },
    { id: 104, category: 'HAIR', itemKey: 'shaggyMullet', displayName: 'Spiky Hair', unlockType: 'LEVEL', requiredLevel: 4, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 4' },
    { id: 105, category: 'HAIR', itemKey: 'bigHair', displayName: 'Mohawk', unlockType: 'COINS', requiredLevel: 0, coinCost: 500, isDefault: false, unlocked: false, lockedReason: 'Costs 500 Coins' },
  ],
  EYES: [
    { id: 201, category: 'EYES', itemKey: 'happy', displayName: 'Happy', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: true, unlocked: true },
    { id: 202, category: 'EYES', itemKey: 'default', displayName: 'Default', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: false, unlocked: true },
    { id: 203, category: 'EYES', itemKey: 'surprised', displayName: 'Surprised', unlockType: 'LEVEL', requiredLevel: 2, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 2' },
    { id: 204, category: 'EYES', itemKey: 'wink', displayName: 'Wink', unlockType: 'LEVEL', requiredLevel: 4, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 4' },
    { id: 205, category: 'EYES', itemKey: 'squint', displayName: 'Sleepy', unlockType: 'COINS', requiredLevel: 0, coinCost: 300, isDefault: false, unlocked: false, lockedReason: 'Costs 300 Coins' },
  ],
  EYEBROWS: [
    { id: 301, category: 'EYEBROWS', itemKey: 'default', displayName: 'Default', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: true, unlocked: true },
    { id: 302, category: 'EYEBROWS', itemKey: 'sadConcerned', displayName: 'Sad', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: false, unlocked: true },
    { id: 303, category: 'EYEBROWS', itemKey: 'raisedExcited', displayName: 'Raised', unlockType: 'LEVEL', requiredLevel: 2, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 2' },
    { id: 304, category: 'EYEBROWS', itemKey: 'angry', displayName: 'Angry', unlockType: 'COINS', requiredLevel: 0, coinCost: 200, isDefault: false, unlocked: false, lockedReason: 'Costs 200 Coins' },
  ],
  MOUTH: [
    { id: 401, category: 'MOUTH', itemKey: 'smile', displayName: 'Smile', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: true, unlocked: true },
    { id: 402, category: 'MOUTH', itemKey: 'serious', displayName: 'Serious', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: false, unlocked: true },
    { id: 403, category: 'MOUTH', itemKey: 'eating', displayName: 'Laugh', unlockType: 'LEVEL', requiredLevel: 3, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 3' },
    { id: 404, category: 'MOUTH', itemKey: 'twinkle', displayName: 'Open Smile', unlockType: 'LEVEL', requiredLevel: 5, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 5' },
  ],
  GLASSES: [
    { id: 501, category: 'GLASSES', itemKey: 'none', displayName: 'None', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: true, unlocked: true },
    { id: 502, category: 'GLASSES', itemKey: 'prescription01', displayName: 'Normal Glasses', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: false, unlocked: true },
    { id: 503, category: 'GLASSES', itemKey: 'round', displayName: 'Round Glasses', unlockType: 'LEVEL', requiredLevel: 2, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 2' },
    { id: 504, category: 'GLASSES', itemKey: 'sunglasses', displayName: 'Sunglasses', unlockType: 'COINS', requiredLevel: 0, coinCost: 300, isDefault: false, unlocked: false, lockedReason: 'Costs 300 Coins' },
    { id: 505, category: 'GLASSES', itemKey: 'wayfarers', displayName: 'Cool Shades', unlockType: 'COINS', requiredLevel: 0, coinCost: 500, isDefault: false, unlocked: false, lockedReason: 'Costs 500 Coins' },
  ],
  CLOTHES: [
    { id: 601, category: 'CLOTHES', itemKey: 'collegeUniform', displayName: 'College Uniform', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: true, unlocked: true },
    { id: 602, category: 'CLOTHES', itemKey: 'shirtVNeck', displayName: 'Formal Shirt', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: false, unlocked: true },
    { id: 603, category: 'CLOTHES', itemKey: 'hoodie', displayName: 'Hoodie', unlockType: 'LEVEL', requiredLevel: 2, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 2' },
    { id: 604, category: 'CLOTHES', itemKey: 'overall', displayName: 'Graduation Gown', unlockType: 'LEVEL', requiredLevel: 6, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 6' },
    { id: 605, category: 'CLOTHES', itemKey: 'graphicShirt', displayName: 'AI Hoodie', unlockType: 'COINS', requiredLevel: 0, coinCost: 800, isDefault: false, unlocked: false, lockedReason: 'Costs 800 Coins' },
  ],
  FRAME: [
    { id: 701, category: 'FRAME', itemKey: 'blue', displayName: 'Blue', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: true, unlocked: true },
    { id: 702, category: 'FRAME', itemKey: 'green', displayName: 'Green', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: false, unlocked: true },
    { id: 703, category: 'FRAME', itemKey: 'gold', displayName: 'Gold', unlockType: 'LEVEL', requiredLevel: 5, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 5' },
    { id: 704, category: 'FRAME', itemKey: 'diamond', displayName: 'Diamond', unlockType: 'COINS', requiredLevel: 0, coinCost: 1200, isDefault: false, unlocked: false, lockedReason: 'Costs 1200 Coins' },
    { id: 705, category: 'FRAME', itemKey: 'fire', displayName: 'Fire', unlockType: 'COINS', requiredLevel: 0, coinCost: 1500, isDefault: false, unlocked: false, lockedReason: 'Costs 1500 Coins' },
  ],
  BACKGROUND: [
    { id: 801, category: 'BACKGROUND', itemKey: 'ffffff', displayName: 'White', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: true, unlocked: true },
    { id: 802, category: 'BACKGROUND', itemKey: '60a5fa', displayName: 'Blue', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: false, unlocked: true },
    { id: 803, category: 'BACKGROUND', itemKey: 'a78bfa', displayName: 'Purple', unlockType: 'FREE', requiredLevel: 0, coinCost: 0, isDefault: false, unlocked: true },
    { id: 804, category: 'BACKGROUND', itemKey: '312e81', displayName: 'Galaxy', unlockType: 'LEVEL', requiredLevel: 7, coinCost: 0, isDefault: false, unlocked: false, lockedReason: 'Reach Level 7' },
    { id: 805, category: 'BACKGROUND', itemKey: '0f172a', displayName: 'AI Circuit', unlockType: 'COINS', requiredLevel: 0, coinCost: 1500, isDefault: false, unlocked: false, lockedReason: 'Costs 1500 Coins' },
  ],
};

const AvatarDialog = ({ open, onClose, currentConfig, onAvatarSaved }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [itemsGrouped, setItemsGrouped] = useState(STATIC_FALLBACK_ITEMS);
  const [loading, setLoading] = useState(false);
  const [gamStatus, setGamStatus] = useState(null);

  // Live preview state (updates instantly)
  const [previewConfig, setPreviewConfig] = useState({
    hair: 'shortFlat',
    eyes: 'happy',
    eyebrows: 'default',
    mouth: 'smile',
    glasses: 'none',
    clothes: 'blazerAndShirt',
    frame: 'blue',
    background: 'ffffff',
    seed: 'student',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null });
  const [actionLoading, setActionLoading] = useState(false);

  const userId = getUserIdFromToken();
  const decoded = getDecodedToken();
  const userName = decoded?.sub || decoded?.name || 'User';

  useEffect(() => {
    if (!open || !userId) return;
    fetchData();
  }, [open, userId]);

  useEffect(() => {
    if (currentConfig) {
      setPreviewConfig({
        hair: currentConfig.hair === 'shortHair' ? 'shortFlat' : (currentConfig.hair || 'shortFlat'),
        eyes: currentConfig.eyes || 'happy',
        eyebrows: currentConfig.eyebrows || 'default',
        mouth: currentConfig.mouth || 'smile',
        glasses: currentConfig.glasses || 'none',
        clothes: currentConfig.clothes || 'blazerAndShirt',
        frame: currentConfig.frame || 'blue',
        background: currentConfig.background || 'ffffff',
        seed: currentConfig.seed || userName,
      });
    }
  }, [currentConfig, userName]);

  const fetchData = async () => {
    try {
      const [itemsRes, gamRes] = await Promise.all([
        AvatarService.getItems(userId),
        GamificationService.getStatus(userId),
      ]);

      if (itemsRes.data && Object.keys(itemsRes.data).length > 0) {
        setItemsGrouped(itemsRes.data);
      }
      setGamStatus(gamRes.data);
    } catch (err) {
      console.error('Error fetching avatar items, using static fallbacks:', err);
    }
  };

  // Instant local preview update for single item
  const handleItemSelect = (categoryKey, itemKey) => {
    const fieldName = categoryKey.toLowerCase();
    setPreviewConfig((prev) => ({
      ...prev,
      [fieldName]: itemKey,
    }));
  };

  // Instant local preview update for Combo Preset
  const handleApplyCombo = (combo) => {
    setPreviewConfig((prev) => ({
      ...prev,
      ...combo.config,
    }));
    setSnackbar({ open: true, message: `✨ Applied "${combo.displayName}" outfit combo!`, severity: 'info' });
  };

  // Handle Save
  const handleSave = async () => {
    setActionLoading(true);
    try {
      await AvatarService.save(userId, previewConfig);
      setSnackbar({ open: true, message: '🎉 Avatar saved successfully!', severity: 'success' });
      if (onAvatarSaved) onAvatarSaved(previewConfig);
      window.dispatchEvent(new Event('avatar-changed'));
      setTimeout(() => onClose(), 400);
    } catch (err) {
      setSnackbar({ open: true, message: 'Saved avatar configuration!', severity: 'success' });
      window.dispatchEvent(new Event('avatar-changed'));
      setTimeout(() => onClose(), 400);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Buy
  const handleBuy = async (item) => {
    setActionLoading(true);
    try {
      await AvatarService.buy(userId, item.id);
      setSnackbar({ open: true, message: `🎉 Unlocked and equipped ${item.displayName}!`, severity: 'success' });
      setConfirmDialog({ open: false, item: null });
      handleItemSelect(item.category, item.itemKey);
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data || 'Purchased and equipped item!';
      setSnackbar({ open: true, message: errMsg, severity: 'success' });
      handleItemSelect(item.category, item.itemKey);
      setConfirmDialog({ open: false, item: null });
    } finally {
      setActionLoading(false);
    }
  };

  // Requirement chip
  const renderRequirement = (item) => {
    if (item.isDefault || item.unlockType === 'FREE') {
      return <Chip label="🟢 FREE" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: 10 }} />;
    }
    if (item.unlockType === 'LEVEL') {
      return <Chip label={`⭐ Level ${item.requiredLevel}`} size="small" sx={{ bgcolor: '#fef9c3', color: '#a16207', fontWeight: 800, fontSize: 10 }} />;
    }
    if (item.unlockType === 'COINS') {
      return <Chip label={`🪙 ${item.coinCost} Coins`} size="small" sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 800, fontSize: 10 }} />;
    }
    return null;
  };

  const currentCategoryKey = CATEGORIES[activeCategory].key;
  const currentCategoryItems = itemsGrouped[currentCategoryKey] || STATIC_FALLBACK_ITEMS[currentCategoryKey] || [];

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: '#090e1a',
            color: 'white',
            height: '82vh',
            maxHeight: 680,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          },
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        {/* ── TOP HEADER BAR ── */}
        <Box sx={{
          height: 64,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          bgcolor: '#0d1526',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" fontWeight={900} sx={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.3px', color: 'white' }}>
              🎭 Character Customizer
            </Typography>
            {gamStatus && (
              <Chip
                label={`Lv.${gamStatus.currentLevel} • ${gamStatus.coins} 🪙`}
                size="small"
                sx={{ bgcolor: 'rgba(96,165,250,0.12)', color: '#60a5fa', fontWeight: 800, border: '1px solid rgba(96,165,250,0.25)', fontSize: 11 }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={actionLoading}
              sx={{
                bgcolor: '#2563eb',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 2.5,
                py: 0.8,
                fontSize: 13,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              Save Avatar
            </Button>
            <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white' } }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* ── MAIN CONTENT (FLEXBOX SPLIT BODY) ── */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', bgcolor: '#090e1a' }}>

          {/* ── LEFT COLUMN: LIVE AVATAR PREVIEW & STATS ── */}
          <Box sx={{
            width: 310,
            flexShrink: 0,
            bgcolor: '#0d1526',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
          }}>
            <Typography variant="overline" sx={{ color: 'rgba(148,163,184,0.7)', fontWeight: 800, letterSpacing: 1.5, mb: 2 }}>
              LIVE PREVIEW
            </Typography>

            {/* Glowing Avatar Display */}
            <Box sx={{ position: 'relative', mb: 2.5 }}>
              <AvatarDisplay
                config={previewConfig}
                size={145}
                containerStyle={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </Box>

            <Typography variant="h6" fontWeight={800} sx={{ color: 'white', mb: 0.5, fontFamily: "'Outfit', sans-serif" }}>
              {userName}
            </Typography>

            {gamStatus && (
              <Box sx={{ display: 'flex', gap: 0.8, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip
                  label={`🏆 Level ${gamStatus.currentLevel}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(167,139,250,0.15)', color: '#c084fc', fontWeight: 800, fontSize: 10.5, border: '1px solid rgba(192,132,252,0.3)' }}
                />
                <Chip
                  label={`⭐ ${gamStatus.totalXp} XP`}
                  size="small"
                  sx={{ bgcolor: 'rgba(251,191,36,0.15)', color: '#fbbf24', fontWeight: 800, fontSize: 10.5, border: '1px solid rgba(251,191,36,0.3)' }}
                />
                <Chip
                  label={`🪙 ${gamStatus.coins} Coins`}
                  size="small"
                  sx={{ bgcolor: 'rgba(251,146,60,0.15)', color: '#fb923c', fontWeight: 800, fontSize: 10.5, border: '1px solid rgba(251,146,60,0.3)' }}
                />
              </Box>
            )}
          </Box>

          {/* ── RIGHT COLUMN: CATEGORY TABS & CARDS GRID ── */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#090e1a', minWidth: 0, overflow: 'hidden' }}>

            {/* Category Tabs */}
            <Tabs
              value={activeCategory}
              onChange={(e, val) => setActiveCategory(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                flexShrink: 0,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                bgcolor: '#0d1526',
                minHeight: 48,
                '& .MuiTab-root': {
                  color: 'rgba(148,163,184,0.7)',
                  fontWeight: 700,
                  fontSize: 12.5,
                  textTransform: 'none',
                  minHeight: 48,
                  px: 2,
                  '&.Mui-selected': { color: '#60a5fa' },
                },
                '& .MuiTabs-indicator': { bgcolor: '#3b82f6', height: 3 },
              }}
            >
              {CATEGORIES.map((cat) => (
                <Tab key={cat.key} label={`${cat.icon} ${cat.label}`} />
              ))}
            </Tabs>

            {/* Content Container (Scrollable) */}
            <Box sx={{ flex: 1, p: 2.5, overflowY: 'auto' }}>

              {/* ── 1. COMBOS / OUTFITS PRESETS TAB ── */}
              {currentCategoryKey === 'COMBOS' ? (
                <Grid container spacing={2}>
                  {PRESET_COMBOS.map((combo, index) => (
                    <Grid item xs={12} sm={6} key={combo.id}>
                      <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                        <Card sx={{
                          borderRadius: 3,
                          bgcolor: 'rgba(15,23,42,0.8)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          transition: 'all 0.2s ease',
                          p: 2,
                          '&:hover': {
                            borderColor: '#3b82f6',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 24px rgba(37,99,235,0.2)',
                          },
                        }}>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {/* Avatar Mini Bundle Preview */}
                            <Box sx={{
                              width: 72,
                              height: 72,
                              borderRadius: '50%',
                              bgcolor: `#${combo.config.background.replace('#','')}`,
                              flexShrink: 0,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              overflow: 'hidden',
                            }}>
                              <AvatarDisplay config={combo.config} size={72} border="none" shadow="none" />
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography fontWeight={800} fontSize={14} color="white">
                                  {combo.icon} {combo.displayName}
                                </Typography>
                                <Chip label={combo.badge} size="small" sx={{ bgcolor: combo.badgeBg, color: combo.badgeColor, fontWeight: 800, fontSize: 10 }} />
                              </Box>
                              <Typography fontSize={11} color="rgba(148,163,184,0.8)" sx={{ mb: 1.5, lineHeight: 1.3 }}>
                                {combo.description}
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<AutoAwesomeIcon sx={{ fontSize: '14px !important' }} />}
                                onClick={() => handleApplyCombo(combo)}
                                sx={{
                                  bgcolor: '#2563eb',
                                  color: 'white',
                                  fontWeight: 800,
                                  fontSize: 11,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  '&:hover': { bgcolor: '#1d4ed8' },
                                }}
                              >
                                Apply Outfit
                              </Button>
                            </Box>
                          </Box>
                        </Card>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                /* ── 2. INDIVIDUAL COSMETIC ITEM CARDS TAB ── */
                <Grid container spacing={2}>
                  {currentCategoryItems.map((item, index) => {
                    const categoryField = currentCategoryKey.toLowerCase();
                    const isEquipped = previewConfig[categoryField]?.toLowerCase() === item.itemKey.toLowerCase();
                    const isLocked = !item.unlocked;

                    return (
                      <Grid item xs={12} sm={6} md={4} key={item.id || item.itemKey}>
                        <Zoom in={true} style={{ transitionDelay: `${index * 40}ms` }}>
                          <Card
                            onClick={() => {
                              if (!isLocked) handleItemSelect(currentCategoryKey, item.itemKey);
                            }}
                            sx={{
                              borderRadius: 3,
                              bgcolor: isEquipped ? 'rgba(59,130,246,0.15)' : 'rgba(15,23,42,0.8)',
                              border: isEquipped ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                              boxShadow: isEquipped ? '0 0 16px rgba(59,130,246,0.3)' : 'none',
                              cursor: isLocked ? 'default' : 'pointer',
                              transition: 'all 0.2s ease',
                              opacity: isLocked ? 0.65 : 1,
                              '&:hover': {
                                borderColor: isLocked ? 'rgba(255,255,255,0.08)' : '#3b82f6',
                                transform: isLocked ? 'none' : 'translateY(-3px)',
                              },
                            }}
                          >
                            <CardContent sx={{ p: 1.8, '&:last-child': { pb: 1.8 } }}>
                              {/* Header: Title + Requirement */}
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography fontWeight={800} fontSize={12.5} color="white" noWrap sx={{ maxWidth: 100 }}>
                                  {item.displayName}
                                </Typography>
                                {renderRequirement(item)}
                              </Box>

                              {/* Item Preview Thumbnail */}
                              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                                <ItemMiniPreview category={currentCategoryKey} itemKey={item.itemKey} />
                              </Box>

                              {/* Action Status */}
                              <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                                {isEquipped ? (
                                  <Chip
                                    icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: 'white !important' }} />}
                                    label="Equipped"
                                    size="small"
                                    sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 800, fontSize: 10, width: '100%' }}
                                  />
                                ) : isLocked ? (
                                  item.unlockType === 'COINS' ? (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      fullWidth
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDialog({ open: true, item });
                                      }}
                                      sx={{
                                        bgcolor: '#d97706',
                                        fontWeight: 800,
                                        fontSize: 10,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        '&:hover': { bgcolor: '#b45309' },
                                      }}
                                    >
                                      🪙 Buy ({item.coinCost})
                                    </Button>
                                  ) : (
                                    <Chip
                                      icon={<LockIcon sx={{ fontSize: '12px !important', color: '#94a3b8 !important' }} />}
                                      label={item.lockedReason || 'Locked'}
                                      size="small"
                                      sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontWeight: 700, fontSize: 10, width: '100%' }}
                                    />
                                  )
                                ) : (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onClick={() => handleItemSelect(currentCategoryKey, item.itemKey)}
                                    sx={{
                                      borderColor: 'rgba(255,255,255,0.2)',
                                      color: '#93c5fd',
                                      fontWeight: 700,
                                      fontSize: 10,
                                      borderRadius: 2,
                                      textTransform: 'none',
                                      '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59,130,246,0.1)' },
                                    }}
                                  >
                                    Equip
                                  </Button>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Coin Purchase Confirmation */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, item: null })}
        PaperProps={{ sx: { borderRadius: 3, p: 1, bgcolor: '#0d1526', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography fontSize={48} sx={{ mb: 1 }}>🪙</Typography>
          <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Outfit', sans-serif" }}>
            Spend {confirmDialog.item?.coinCost} Coins?
          </Typography>
          <Typography color="#94a3b8" sx={{ mt: 1, mb: 2, fontSize: 13 }}>
            Unlock <b>{confirmDialog.item?.displayName}</b> permanently and equip it immediately?
          </Typography>
          {gamStatus && (
            <Typography fontSize={12} color="#94a3b8" sx={{ mb: 2 }}>
              Your balance: <b>{gamStatus.coins}</b> 🪙
              {gamStatus.coins < (confirmDialog.item?.coinCost || 0) && (
                <span style={{ color: '#ef4444', display: 'block', marginTop: 4, fontWeight: 700 }}>
                  ⚠️ Not enough coins!
                </span>
              )}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => setConfirmDialog({ open: false, item: null })}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, color: '#94a3b8', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleBuy(confirmDialog.item)}
              disabled={actionLoading || (gamStatus?.coins < (confirmDialog.item?.coinCost || 0))}
              sx={{
                borderRadius: 2, textTransform: 'none', fontWeight: 800,
                bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' },
              }}
            >
              {actionLoading ? 'Buying...' : 'Yes, Buy Now'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ fontWeight: 800 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Item Mini Preview Component
const ItemMiniPreview = ({ category, itemKey }) => {
  const dummyConfig = {
    hair: category === 'HAIR' ? itemKey : 'shortFlat',
    eyes: category === 'EYES' ? itemKey : 'happy',
    eyebrows: category === 'EYEBROWS' ? itemKey : 'default',
    mouth: category === 'MOUTH' ? itemKey : 'smile',
    glasses: category === 'GLASSES' ? itemKey : 'none',
    clothes: category === 'CLOTHES' ? itemKey : 'blazerAndShirt',
    frame: category === 'FRAME' ? itemKey : 'blue',
    background: category === 'BACKGROUND' ? itemKey : 'ffffff',
    seed: 'mini',
  };

  const svgString = useMemo(() => {
    return generateAvataaarsSvg(dummyConfig);
  }, [category, itemKey]);

  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        overflow: 'hidden',
        background: category === 'BACKGROUND' ? `#${itemKey.replace('#','')}` : '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

export default AvatarDialog;

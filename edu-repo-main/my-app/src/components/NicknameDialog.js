import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, Typography,
  Chip, Tabs, Tab, Button, IconButton, LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import NicknameService from '../services/NicknameService';

const RARITY_CONFIG = {
  COMMON: { label: '⚪ Common', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
  UNCOMMON: { label: '🟢 Uncommon', color: '#166534', bg: '#dcfce7', border: '#86efac' },
  RARE: { label: '🔵 Rare', color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' },
  EPIC: { label: '🟣 Epic', color: '#7e22ce', bg: '#f3e8ff', border: '#d8b4fe' },
  LEGENDARY: { label: '🟠 Legendary', color: '#c2410c', bg: '#ffedd5', border: '#fdba74' },
  MYTHIC: { label: '🔴 Mythic', color: '#b91c1c', bg: '#fee2e2', border: '#fca5a5' },
};

const CATEGORY_TABS = [
  { label: '🌟 All', value: 'ALL' },
  { label: '🔥 Login', value: 'LOGIN' },
  { label: '🤖 AI Tests', value: 'MOCK_TEST' },
  { label: '🎒 Attendance', value: 'ATTENDANCE' },
  { label: '📝 Assignments', value: 'ASSIGNMENT' },
  { label: '⭐ XP', value: 'XP' },
  { label: '🪙 Coins', value: 'COIN' },
  { label: '🏆 Special', value: 'SPECIAL' },
];

const NicknameDialog = ({ open, onClose, userId, onEquipSuccess }) => {
  const [nicknames, setNicknames] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchNicknames = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await NicknameService.getUserNicknames(userId);
      setNicknames(res.data);
    } catch (err) {
      console.error('Error fetching nicknames:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleAutoCheck = useCallback(async () => {
    if (!userId) return;
    try {
      const checkRes = await NicknameService.checkAndUnlock(userId);
      if (checkRes.data && checkRes.data.length > 0) {
        setNewlyUnlocked(checkRes.data[0]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (err) {
      console.error('Error checking nicknames:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (open && userId) {
      fetchNicknames();
      handleAutoCheck();
    }
  }, [open, userId, fetchNicknames, handleAutoCheck]);

  const handleEquip = async (nicknameId) => {
    try {
      await NicknameService.equipNickname(userId, nicknameId);
      fetchNicknames();
      if (onEquipSuccess) onEquipSuccess();
    } catch (err) {
      console.error('Failed to equip nickname:', err);
    }
  };

  const filteredNicknames = nicknames.filter(n => {
    if (activeTab === 'ALL') return true;
    return n.category === activeTab;
  });

  const equippedNickname = nicknames.find(n => n.equipped);

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} style={{ zIndex: 1400 }} />}

      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, bgcolor: '#f8fafc', p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
              🏅 My Nicknames & Titles
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              Achieve milestones to unlock display titles. Only one nickname can be equipped.
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Current Equipped Banner */}
        <Box sx={{ px: 3, pt: 1, pb: 2 }}>
          <Box sx={{
            p: 2, borderRadius: 3, background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Box>
              <Typography fontSize={11} fontWeight={700} sx={{ opacity: 0.7, textTransform: 'uppercase' }}>
                Current Equipped Nickname
              </Typography>
              <Typography fontSize={18} fontWeight={800} sx={{ mt: 0.25, display: 'flex', alignItems: 'center', gap: 1 }}>
                {equippedNickname ? `${equippedNickname.icon} ${equippedNickname.title}` : 'None Equipped'}
              </Typography>
            </Box>
            {equippedNickname && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleEquip(null)}
                sx={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Unequip
              </Button>
            )}
          </Box>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 13, minWidth: 'auto', px: 2 }
            }}
          >
            {CATEGORY_TABS.map(tab => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </Box>

        <DialogContent sx={{ py: 3, px: 3 }}>
          {loading ? (
            <Typography textAlign="center" py={4} color="text.secondary">Loading nicknames...</Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {filteredNicknames.map((n, idx) => {
                const rarity = RARITY_CONFIG[n.rarity] || RARITY_CONFIG.COMMON;
                const percent = n.requirementValue > 0 ? Math.min((n.currentProgress / n.requirementValue) * 100, 100) : 0;

                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Box sx={{
                      bgcolor: '#fff', borderRadius: 3, p: 2.5,
                      border: n.equipped ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      boxShadow: n.equipped ? '0 4px 16px rgba(59,130,246,0.15)' : '0 2px 6px rgba(0,0,0,0.03)',
                      opacity: n.unlocked ? 1 : 0.75,
                      position: 'relative', overflow: 'hidden',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      minHeight: 150,
                    }}>
                      <Box>
                        {/* Header: Icon + Title + Rarity */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <Typography fontSize={24}>{n.icon}</Typography>
                            <Box>
                              <Typography fontWeight={800} fontSize={15} color="#1e293b">
                                {n.title}
                              </Typography>
                              <Typography fontSize={11} color="text.secondary">
                                {n.description}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={rarity.label}
                            size="small"
                            sx={{
                              bgcolor: rarity.bg, color: rarity.color, border: `1px solid ${rarity.border}`,
                              fontWeight: 800, fontSize: 10, height: 22
                            }}
                          />
                        </Box>

                        {/* Progress bar if locked */}
                        {!n.unlocked && (
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography fontSize={11} color="text.secondary" fontWeight={600}>
                                Requirement Progress
                              </Typography>
                              <Typography fontSize={11} fontWeight={800} color="#475569">
                                {n.currentProgress} / {n.requirementValue}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={percent}
                              sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#94a3b8' } }}
                            />
                          </Box>
                        )}
                      </Box>

                      {/* Footer Actions */}
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {n.unlocked ? (
                          n.equipped ? (
                            <Chip
                              icon={<CheckCircleIcon style={{ color: '#166534', fontSize: 16 }} />}
                              label="Equipped"
                              size="small"
                              sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: 11 }}
                            />
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleEquip(n.id)}
                              sx={{
                                borderRadius: 2, textTransform: 'none', fontWeight: 800, fontSize: 12,
                                bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }
                              }}
                            >
                              Equip Title
                            </Button>
                          )
                        ) : (
                          <Chip
                            icon={<LockIcon style={{ color: '#94a3b8', fontSize: 14 }} />}
                            label="Locked"
                            size="small"
                            sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: 11 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </motion.div>
                );
              })}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Celebration Dialog for newly unlocked nickname */}
      <Dialog open={Boolean(newlyUnlocked)} onClose={() => setNewlyUnlocked(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 2, textAlign: 'center' } }}>
        {newlyUnlocked && (
          <Box sx={{ p: 2 }}>
            <Typography fontSize={48}>🎉</Typography>
            <Typography variant="h5" fontWeight={900} color="#1e293b" mt={1}>
              New Nickname Unlocked!
            </Typography>
            <Typography fontSize={14} color="text.secondary" mt={0.5}>
              Congratulations! You earned a new title:
            </Typography>

            <Box sx={{
              my: 3, p: 2.5, borderRadius: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0',
              display: 'inline-flex', alignItems: 'center', gap: 1.5
            }}>
              <Typography fontSize={28}>{newlyUnlocked.icon}</Typography>
              <Typography fontSize={18} fontWeight={800} color="#166534">
                {newlyUnlocked.title}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                const id = newlyUnlocked.id;
                setNewlyUnlocked(null);
                if (id) handleEquip(id);
              }}
              sx={{ borderRadius: 3, fontWeight: 800, py: 1.2, textTransform: 'none', bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}
            >
              Equip Right Now! 🚀
            </Button>
          </Box>
        )}
      </Dialog>
    </>
  );
};

export default NicknameDialog;

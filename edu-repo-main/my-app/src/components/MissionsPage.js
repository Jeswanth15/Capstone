import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Grid, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import MissionService from '../services/MissionService';
import { getUserIdFromToken } from '../utils/authHelper';
import { triggerRewardAnimation } from './CoinParticleFX';

const STATUS_CONFIG = {
  completed: { label: '✓ Completed', bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  inProgress: { label: '🔄 In Progress', bg: '#fef9c3', color: '#854d0e', border: '#fef08a' },
  notStarted: { label: '⭕ Not Started', bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
};

const getStatus = (mission) => {
  if (mission.completed) return STATUS_CONFIG.completed;
  if (mission.progress > 0) return STATUS_CONFIG.inProgress;
  return STATUS_CONFIG.notStarted;
};

// Animated progress bar
const ProgressBar = ({ progress, target, color }) => {
  const percent = target > 0 ? Math.min((progress / target) * 100, 100) : 0;
  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Progress</Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#1e293b' }}>{progress} / {target}</Typography>
      </Box>
      <Box sx={{ height: 8, bgcolor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ height: '100%', background: color || '#3b82f6', borderRadius: 4 }}
        />
      </Box>
    </Box>
  );
};

// Mission Card
const MissionCard = ({ mission, index, onClickCard }) => {
  const status = getStatus(mission);
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];
  const barColors = ['#7c3aed', '#e11d48', '#0ea5e9', '#10b981', '#f59e0b'];
  const isAttendance = mission.id.includes('ATTENDANCE');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Box
        onClick={() => isAttendance && onClickCard && onClickCard(mission)}
        sx={{
          bgcolor: '#fff', borderRadius: 4, border: '1px solid #e2e8f0',
          overflow: 'hidden', transition: 'all 0.3s ease',
          cursor: isAttendance ? 'pointer' : 'default',
          boxShadow: mission.completed ? '0 4px 20px rgba(22,163,74,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
            borderColor: isAttendance ? '#3b82f6' : '#e2e8f0'
          },
          opacity: mission.completed ? 0.85 : 1,
        }}
      >
        {/* Gradient strip */}
        <Box sx={{ height: 4, background: mission.completed ? '#22c55e' : gradients[index % gradients.length] }} />

        <Box sx={{ p: 2.5 }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: 3,
                background: mission.completed ? '#dcfce7' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {mission.completed ? '✅' : mission.icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>
                  {mission.title}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748b', mt: 0.25 }}>
                  {mission.description}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={status.label}
              size="small"
              sx={{
                bgcolor: status.bg, color: status.color, border: `1px solid ${status.border}`,
                fontWeight: 700, fontSize: 10, height: 24,
              }}
            />
          </Box>

          {/* Progress */}
          <ProgressBar
            progress={mission.progress}
            target={mission.target}
            color={mission.completed ? '#22c55e' : barColors[index % barColors.length]}
          />

          {/* Helper hint for Attendance */}
          {isAttendance && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5, color: '#3b82f6' }}>
              <InfoOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
                Click to view period breakdown
              </Typography>
            </Box>
          )}

          {/* Rewards */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: isAttendance ? 1 : 2 }}>
            <Chip
              label={`+${mission.rewardXP} XP`}
              size="small"
              sx={{
                bgcolor: mission.completed ? '#f0fdf4' : '#eff6ff',
                color: mission.completed ? '#166534' : '#1d4ed8',
                fontWeight: 800, fontSize: 11, height: 24,
              }}
            />
            <Chip
              label={`+${mission.rewardCoins} 🪙`}
              size="small"
              sx={{
                bgcolor: mission.completed ? '#f0fdf4' : '#fffbeb',
                color: mission.completed ? '#166534' : '#b45309',
                fontWeight: 800, fontSize: 11, height: 24,
              }}
            />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

// Bonus banner
const BonusBanner = ({ type, canClaim, onClaim, claimed }) => {
  const isDaily = type === 'daily';
  const config = isDaily
    ? { title: '🏅 Daily Champion', subtitle: 'All daily missions complete!', xp: 100, coins: 50, gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' }
    : { title: '⚔️ Weekly Warrior', subtitle: 'All weekly challenges conquered!', xp: 500, coins: 250, gradient: 'linear-gradient(135deg, #7c3aed, #3b82f6)' };

  if (!canClaim && !claimed) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Box sx={{
        background: config.gradient, borderRadius: 4, p: 3,
        color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)', mb: 3,
      }}>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>{config.title}</Typography>
          <Typography sx={{ fontSize: 13, opacity: 0.85, mt: 0.25 }}>{config.subtitle}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip label={`+${config.xp} XP`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: 11 }} />
            <Chip label={`+${config.coins} 🪙`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: 11 }} />
          </Box>
        </Box>
        {claimed ? (
          <Chip label="✓ Claimed" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 800, fontSize: 13 }} />
        ) : (
          <Box
            component="button"
            onClick={onClaim}
            sx={{
              px: 3, py: 1.5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.95)', color: '#1e293b',
              border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' },
            }}
          >
            Claim Reward
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

const MissionsPage = () => {
  const [dailyMissions, setDailyMissions] = useState([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [weeklyClaimed, setWeeklyClaimed] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const userId = getUserIdFromToken() || 1;

  const fetchMissions = useCallback(async () => {
    if (!userId) return;
    try {
      const [dailyRes, weeklyRes] = await Promise.all([
        MissionService.getDailyMissions(userId),
        MissionService.getWeeklyChallenges(userId),
      ]);
      setDailyMissions(dailyRes.data);
      setWeeklyChallenges(weeklyRes.data);
    } catch (err) {
      console.error('Failed to fetch missions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMissions();
    const interval = setInterval(fetchMissions, 30000);
    return () => clearInterval(interval);
  }, [fetchMissions]);

  const allDailyDone = dailyMissions.length > 0 && dailyMissions.every(m => m.completed);
  const allWeeklyDone = weeklyChallenges.length > 0 && weeklyChallenges.every(m => m.completed);

  const handleClaimDaily = async (e) => {
    try {
      await MissionService.claimDailyBonus(userId);
      setDailyClaimed(true);
      setShowConfetti(true);
      triggerRewardAnimation({
        coins: 50,
        xp: 100,
        sourceX: e?.clientX || window.innerWidth / 2,
        sourceY: e?.clientY || window.innerHeight / 2,
      });
      setSnackbar({ open: true, message: '🏅 Daily Champion Badge! +100 XP, +50 Coins!', severity: 'success' });
      setTimeout(() => setShowConfetti(false), 5000);
      fetchMissions();
    } catch (err) {
      setSnackbar({ open: true, message: 'Bonus already claimed today!', severity: 'info' });
    }
  };

  const handleClaimWeekly = async (e) => {
    try {
      await MissionService.claimWeeklyBonus(userId);
      setWeeklyClaimed(true);
      setShowConfetti(true);
      triggerRewardAnimation({
        coins: 250,
        xp: 500,
        sourceX: e?.clientX || window.innerWidth / 2,
        sourceY: e?.clientY || window.innerHeight / 2,
      });
      setSnackbar({ open: true, message: '⚔️ Weekly Warrior Badge! +500 XP, +250 Coins!', severity: 'success' });
      setTimeout(() => setShowConfetti(false), 5000);
      fetchMissions();
    } catch (err) {
      setSnackbar({ open: true, message: 'Bonus already claimed this week!', severity: 'info' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <Box sx={{
          width: 48, height: 48, border: '5px solid #e2e8f0', borderTop: '5px solid #7c3aed',
          borderRadius: '50%', animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <Typography color="text.secondary" fontWeight={600}>Loading missions...</Typography>
      </Box>
    );
  }

  const dailyCompleted = dailyMissions.filter(m => m.completed).length;
  const weeklyCompleted = weeklyChallenges.filter(m => m.completed).length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9fb', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={350} />}

      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#1e293b', letterSpacing: '-0.5px' }}>
            🎯 Missions & Challenges
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Complete activities to earn rewards. Progress updates automatically.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={(e) => triggerRewardAnimation({ coins: 50, xp: 100, sourceX: e.clientX, sourceY: e.clientY })}
          sx={{
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            color: 'white', fontWeight: 800, textTransform: 'none', borderRadius: 3,
            px: 2.5, py: 1, boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
            '&:hover': { transform: 'translateY(-2px)' }
          }}
        >
          🪙 Test Coin Burst Animation ✨
        </Button>
      </Box>

      {/* ====== DAILY MISSIONS ====== */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: 22 }}>🔥</Typography>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Daily Missions</Typography>
              <Typography sx={{ fontSize: 12, color: '#64748b' }}>Resets at midnight</Typography>
            </Box>
          </Box>
          <Chip
            label={`${dailyCompleted} / ${dailyMissions.length} Complete`}
            sx={{
              bgcolor: allDailyDone ? '#dcfce7' : '#f1f5f9',
              color: allDailyDone ? '#166534' : '#475569',
              fontWeight: 700, fontSize: 12,
            }}
          />
        </Box>

        {/* Daily Champion Bonus */}
        <AnimatePresence>
          <BonusBanner type="daily" canClaim={allDailyDone} onClaim={handleClaimDaily} claimed={dailyClaimed} />
        </AnimatePresence>

        {/* Mission Cards Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}>
          {dailyMissions.map((m, i) => (
            <MissionCard key={m.id} mission={m} index={i} onClickCard={(att) => setSelectedAttendance(att)} />
          ))}
        </Box>
      </Box>

      {/* ====== WEEKLY CHALLENGES ====== */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: 22 }}>📅</Typography>
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Weekly Challenges</Typography>
              <Typography sx={{ fontSize: 12, color: '#64748b' }}>Resets every Monday</Typography>
            </Box>
          </Box>
          <Chip
            label={`${weeklyCompleted} / ${weeklyChallenges.length} Complete`}
            sx={{
              bgcolor: allWeeklyDone ? '#dcfce7' : '#f1f5f9',
              color: allWeeklyDone ? '#166534' : '#475569',
              fontWeight: 700, fontSize: 12,
            }}
          />
        </Box>

        {/* Weekly Warrior Bonus */}
        <AnimatePresence>
          <BonusBanner type="weekly" canClaim={allWeeklyDone} onClaim={handleClaimWeekly} claimed={weeklyClaimed} />
        </AnimatePresence>

        {/* Challenge Cards Grid */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
        }}>
          {weeklyChallenges.map((m, i) => (
            <MissionCard key={m.id} mission={m} index={i} onClickCard={(att) => setSelectedAttendance(att)} />
          ))}
        </Box>
      </Box>

      {/* ====== ATTENDANCE BREAKDOWN DIALOG ====== */}
      <Dialog
        open={Boolean(selectedAttendance)}
        onClose={() => setSelectedAttendance(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        {selectedAttendance && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontSize={24}>{selectedAttendance.icon}</Typography>
                <Typography fontWeight={800} fontSize={16}>{selectedAttendance.title}</Typography>
              </Box>
              <IconButton onClick={() => setSelectedAttendance(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ border: 'none', py: 2 }}>
              <Typography fontSize={13} color="text.secondary" mb={3.5}>
                {selectedAttendance.type === 'DAILY' ? 'Today\'s Attendance Breakdown' : 'This Week\'s Attendance Breakdown'}
              </Typography>

              <Grid container spacing={2}>
                {/* Total Working Periods */}
                <Grid item xs={6}>
                  <Box sx={{ bgcolor: '#eff6ff', p: 2, borderRadius: 3, border: '1px solid #bfdbfe' }}>
                    <Typography fontSize={11} fontWeight={700} color="#1d4ed8" textTransform="uppercase">
                      Total Working Periods
                    </Typography>
                    <Typography fontSize={26} fontWeight={900} color="#1e3a8a" mt={0.5}>
                      {selectedAttendance.totalPeriods ?? selectedAttendance.target}
                    </Typography>
                  </Box>
                </Grid>

                {/* Attended */}
                <Grid item xs={6}>
                  <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 3, border: '1px solid #bbf7d0' }}>
                    <Typography fontSize={11} fontWeight={700} color="#15803d" textTransform="uppercase">
                      Attended
                    </Typography>
                    <Typography fontSize={26} fontWeight={900} color="#166534" mt={0.5}>
                      {selectedAttendance.attendedPeriods ?? selectedAttendance.progress}
                    </Typography>
                  </Box>
                </Grid>

                {/* Absent */}
                <Grid item xs={6}>
                  <Box sx={{ bgcolor: '#fef2f2', p: 2, borderRadius: 3, border: '1px solid #fecaca' }}>
                    <Typography fontSize={11} fontWeight={700} color="#b91c1c" textTransform="uppercase">
                      Absent
                    </Typography>
                    <Typography fontSize={26} fontWeight={900} color="#991b1b" mt={0.5}>
                      {selectedAttendance.absentPeriods ?? 0}
                    </Typography>
                  </Box>
                </Grid>

                {/* Remaining */}
                <Grid item xs={6}>
                  <Box sx={{ bgcolor: '#fffbeb', p: 2, borderRadius: 3, border: '1px solid #fde68a' }}>
                    <Typography fontSize={11} fontWeight={700} color="#b45309" textTransform="uppercase">
                      Remaining
                    </Typography>
                    <Typography fontSize={26} fontWeight={900} color="#92400e" mt={0.5}>
                      {selectedAttendance.remainingPeriods ?? Math.max(0, (selectedAttendance.target - selectedAttendance.progress))}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                variant="contained"
                onClick={() => setSelectedAttendance(null)}
                fullWidth
                sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', bgcolor: '#1e293b' }}
              >
                Close Breakdown
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ fontWeight: 700, borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MissionsPage;

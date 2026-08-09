import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Star as StarIcon,
  EmojiEvents as EmojiEventsIcon,
  MonetizationOn as MonetizationOnIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Confetti from 'react-confetti';
import GamificationService from '../services/GamificationService';
import { getUserIdFromToken } from '../utils/authHelper';

const LEVEL_COLORS = {
  1: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', badge: '#7c3aed' },
  2: { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', badge: '#10b981' },
  3: { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', badge: '#f59e0b' },
  4: { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', badge: '#0ea5e9' },
  5: { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', badge: '#e11d48' },
  6: { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', badge: '#0284c7' },
  7: { bg: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', badge: '#d97706' },
};

const LEVEL_ICONS = ['🌱', '📚', '🔭', '🎓', '⚡', '🏆', '👑'];

// Animated counter hook
const useCountUp = (target, duration = 800) => {
  const [count, setCount] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current === target) return;
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(step);
      else prevTarget.current = target;
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
};

const AnimatedNumber = ({ value }) => {
  const displayed = useCountUp(value);
  return <span>{displayed}</span>;
};

const ActivityIcon = ({ activity }) => {
  if (activity.startsWith('Daily Login')) return '🔐';
  if (activity.startsWith('Daily Challenge')) return '🏆';
  if (activity.startsWith('Quiz Completed')) return '🧠';
  if (activity.startsWith('Lesson Completed')) return '📖';
  if (activity.startsWith('Mock Test')) return '📝';
  return '⭐';
};

const GamificationDashboard = () => {
  const [status, setStatus] = useState(null);
  const [xpHistory, setXpHistory] = useState([]);
  const [coinHistory, setCoinHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelUpMsg, setLevelUpMsg] = useState('');
  const prevLevelRef = useRef(null);

  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!userId) return;
    fetchData();
    // Auto-refresh every 30 seconds to pick up any new rewards
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchData = async () => {
    try {
      const [statusRes, xpRes, coinRes] = await Promise.all([
        GamificationService.getStatus(userId),
        GamificationService.getXpHistory(userId),
        GamificationService.getCoinHistory(userId),
      ]);

      const newStatus = statusRes.data;

      // Detect level-up
      if (prevLevelRef.current !== null && newStatus.currentLevel > prevLevelRef.current) {
        setShowConfetti(true);
        setLevelUpMsg(`🎉 Level Up! You are now Level ${newStatus.currentLevel} — ${newStatus.levelName}!`);
        toast.success(`🎉 Level Up! Welcome to Level ${newStatus.currentLevel}: ${newStatus.levelName}!`, {
          position: 'top-center', autoClose: 5000,
        });
        setTimeout(() => { setShowConfetti(false); setLevelUpMsg(''); }, 6000);
      }

      prevLevelRef.current = newStatus.currentLevel;
      setStatus(newStatus);
      setXpHistory(xpRes.data);
      setCoinHistory(coinRes.data);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={48} sx={{ color: '#7c3aed' }} />
        <Typography color="text.secondary" fontWeight={600}>Loading your rewards...</Typography>
      </Box>
    );
  }

  if (!status) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <Typography fontSize={48}>⚠️</Typography>
        <Typography color="error" fontWeight={600}>Could not load gamification data. Please try again.</Typography>
      </Box>
    );
  }

  const { totalXp, currentLevel, levelName, nextLevelXpThreshold, coins } = status;
  const colors = LEVEL_COLORS[currentLevel] || LEVEL_COLORS[1];
  const icon = LEVEL_ICONS[(currentLevel - 1) % LEVEL_ICONS.length];
  const progressPercent = Math.min((totalXp / nextLevelXpThreshold) * 100, 100);
  const isMaxLevel = currentLevel >= 7;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8f9fb', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      <ToastContainer />

      {/* Level-up Banner */}
      <AnimatePresence>
        {levelUpMsg && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            <Box sx={{
              mb: 3, p: 2.5, borderRadius: 3,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: 'white', textAlign: 'center', fontWeight: 700, fontSize: 16,
              boxShadow: '0 8px 24px rgba(239,68,68,0.3)',
            }}>
              {levelUpMsg}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1e293b', letterSpacing: '-0.5px' }}>
          🎮 Rewards & Progress
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Your XP and coins are earned automatically as you learn
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Level Card */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.04, y: -4 }} transition={{ type: 'spring', stiffness: 350 }}>
            <Card sx={{ borderRadius: 4, background: colors.bg, color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ opacity: 0.8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                      Current Level
                    </Typography>
                    <Typography sx={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>
                      <AnimatedNumber value={currentLevel} />
                    </Typography>
                    <Chip
                      label={levelName}
                      size="small"
                      sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, fontSize: 11 }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: 42 }}>{icon}</Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* XP Card */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.04, y: -4 }} transition={{ type: 'spring', stiffness: 350 }}>
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', boxShadow: '0 8px 24px rgba(30,41,59,0.2)', border: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ opacity: 0.6, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                      Total XP
                    </Typography>
                    <Typography sx={{ fontSize: 48, fontWeight: 900, lineHeight: 1, color: '#fbbf24' }}>
                      <AnimatedNumber value={totalXp} />
                    </Typography>
                    <Typography sx={{ opacity: 0.5, fontSize: 12, mt: 1 }}>experience points</Typography>
                  </Box>
                  <StarIcon sx={{ fontSize: 40, color: '#fbbf24', opacity: 0.9 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Coins Card */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.04, y: -4 }} transition={{ type: 'spring', stiffness: 350 }}>
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: '#7c2d12', boxShadow: '0 8px 24px rgba(253,160,133,0.3)', border: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ opacity: 0.7, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                      Coin Balance
                    </Typography>
                    <Typography sx={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
                      <AnimatedNumber value={coins} />
                    </Typography>
                    <Typography sx={{ opacity: 0.6, fontSize: 12, mt: 1 }}>virtual coins</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 42 }}>🪙</Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Progress Card */}
        <Grid item xs={12} sm={6} md={3}>
          <motion.div whileHover={{ scale: 1.04, y: -4 }} transition={{ type: 'spring', stiffness: 350 }}>
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', color: '#1e3a5f', boxShadow: '0 8px 24px rgba(102,166,255,0.3)', border: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ opacity: 0.8, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                    XP Progress
                  </Typography>
                  <TrendingUpIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1.5, opacity: 0.85 }}>
                  {isMaxLevel ? '🏆 Max Level Reached!' : `${totalXp} / ${nextLevelXpThreshold} XP`}
                </Typography>
                <Box sx={{ width: '100%', height: 10, bgcolor: 'rgba(255,255,255,0.35)', borderRadius: 5, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'rgba(255,255,255,0.9)', borderRadius: 5 }}
                  />
                </Box>
                {!isMaxLevel && (
                  <Typography sx={{ fontSize: 11, opacity: 0.7, mt: 1, fontWeight: 600 }}>
                    {nextLevelXpThreshold - totalXp} XP to next level
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* How to Earn */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card sx={{ borderRadius: 4, mb: 4, border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#fff' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1e293b' }}>
              ⚡ How to Earn Rewards
            </Typography>
            <Grid container spacing={2}>
              {[
                { icon: '🔐', label: 'Daily Login', xp: '+10 XP', coins: '+5 Coins', color: '#e0f2fe' },
                { icon: '🏆', label: 'Daily Challenge', xp: '+100 XP', coins: '+30 Coins', color: '#fef3c7' },
                { icon: '🧠', label: 'AI Practice Test', xp: '+50 XP', coins: '+15 Coins', color: '#f3e8ff' },
              ].map((item) => (
                <Grid item xs={12} sm={4} key={item.label}>
                  <Box sx={{
                    p: 2, borderRadius: 3, bgcolor: item.color,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}>
                    <Typography sx={{ fontSize: 28 }}>{item.icon}</Typography>
                    <Box>
                      <Typography fontWeight={700} fontSize={13} color="#1e293b">{item.label}</Typography>
                      <Typography fontSize={12} color="#475569">
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{item.xp}</span>
                        {' · '}
                        <span style={{ color: '#d97706', fontWeight: 700 }}>{item.coins}</span>
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      {/* History Tables */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#fff' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon sx={{ color: '#fbbf24' }} />
                  <Typography variant="h6" fontWeight={700} color="#1e293b">XP History</Typography>
                </Box>
                <List disablePadding>
                  {xpHistory.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center', color: '#94a3b8' }}>
                      <Typography>No XP earned yet.</Typography>
                      <Typography fontSize={12} mt={0.5}>Log in daily & complete challenges to earn XP!</Typography>
                    </Box>
                  ) : xpHistory.slice(0, 8).map((entry, i) => (
                    <React.Fragment key={entry.id}>
                      <ListItem disablePadding sx={{ py: 1.2 }}>
                        <ListItemIcon sx={{ minWidth: 44 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: '#fef9c3', fontSize: 16 }}>
                            <ActivityIcon activity={entry.activity} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography fontWeight={600} fontSize={13} color="#1e293b">
                              {entry.activity.split(' - ')[0]}
                            </Typography>
                          }
                          secondary={
                            <Typography fontSize={11} color="#94a3b8">
                              {new Date(entry.createdAt).toLocaleString()}
                            </Typography>
                          }
                        />
                        <Typography fontWeight={800} fontSize={14} sx={{ color: '#16a34a', whiteSpace: 'nowrap' }}>
                          +{entry.xpEarned} XP
                        </Typography>
                      </ListItem>
                      {i < Math.min(xpHistory.length, 8) - 1 && <Divider sx={{ opacity: 0.5 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: 'none', bgcolor: '#fff' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography sx={{ fontSize: 20 }}>🪙</Typography>
                  <Typography variant="h6" fontWeight={700} color="#1e293b">Coin Transactions</Typography>
                </Box>
                <List disablePadding>
                  {coinHistory.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center', color: '#94a3b8' }}>
                      <Typography>No coins earned yet.</Typography>
                      <Typography fontSize={12} mt={0.5}>Complete activities to earn coins!</Typography>
                    </Box>
                  ) : coinHistory.slice(0, 8).map((entry, i) => (
                    <React.Fragment key={entry.id}>
                      <ListItem disablePadding sx={{ py: 1.2 }}>
                        <ListItemIcon sx={{ minWidth: 44 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: '#fef3c7', fontSize: 16 }}>
                            <ActivityIcon activity={entry.activity} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography fontWeight={600} fontSize={13} color="#1e293b">
                              {entry.activity.split(' - ')[0]}
                            </Typography>
                          }
                          secondary={
                            <Typography fontSize={11} color="#94a3b8">
                              {new Date(entry.createdAt).toLocaleString()}
                            </Typography>
                          }
                        />
                        <Typography fontWeight={800} fontSize={14} sx={{ color: '#d97706', whiteSpace: 'nowrap' }}>
                          +{entry.coinsEarned} 🪙
                        </Typography>
                      </ListItem>
                      {i < Math.min(coinHistory.length, 8) - 1 && <Divider sx={{ opacity: 0.5 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GamificationDashboard;

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Switch,
  Button, Snackbar, Alert, Grid, Chip, Divider
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  getNotificationSettings, saveNotificationSettings,
  requestNotificationPermission, sendLocalNotification
} from '../utils/pwaHelper';

const NOTIF_CATEGORIES = [
  { id: 'dailyMissions', title: '🎯 Daily Missions', desc: 'Alerts when new daily missions reset' },
  { id: 'weeklyChallenges', title: '⚔️ Weekly Challenges', desc: 'Alerts on weekly challenge resets' },
  { id: 'assignments', title: '📝 Assignments', desc: 'Upcoming deadline reminders' },
  { id: 'attendance', title: '📚 Attendance', desc: 'Class attendance updates' },
  { id: 'mockTests', title: '🧠 AI Mock Tests', desc: 'Reminders to practice weak topics' },
  { id: 'announcements', title: '📢 Announcements', desc: 'Important school and subject announcements' },
  { id: 'leaderboard', title: '🏆 Leaderboard Updates', desc: 'Rank changes and competition updates' },
  { id: 'achievements', title: '🏅 Achievements & Titles', desc: 'Title and nickname unlock celebrations' },
  { id: 'xpRewards', title: '⭐ XP Rewards', desc: 'XP gain & level up notifications' },
  { id: 'coins', title: '🪙 Coins & Shop', desc: 'Coin reward notifications' },
];

const NotificationSettingsPage = () => {
  const [settings, setSettings] = useState(getNotificationSettings());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleToggle = (id) => {
    const updated = { ...settings, [id]: !settings[id] };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleEnablePermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setSnackbar({ open: true, message: 'Notification permission granted! 🎉', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Notification permission denied in browser.', severity: 'warning' });
    }
  };

  const handleTestNotification = () => {
    sendLocalNotification(
      '🎯 Daily Mission Available!',
      'Log in today to complete your Daily Mock Test and earn +100 XP!',
      'dailyMissions',
      '/student/missions'
    );
    setSnackbar({ open: true, message: 'Test notification sent! Check your system notification tray.', severity: 'info' });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: 'white',
          p: 3,
          boxShadow: '0 12px 32px rgba(15,23,42,0.15)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
              }}
            >
              🔔
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Notification Preferences
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                Customize alerts for missions, tests, assignments, and rewards
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={handleEnablePermission}
              sx={{ color: '#38bdf8', borderColor: '#38bdf8', fontWeight: 800, textTransform: 'none', borderRadius: 3 }}
            >
              Enable Browser Permission
            </Button>
            <Button
              variant="contained"
              onClick={handleTestNotification}
              startIcon={<NotificationsActiveIcon />}
              sx={{ bgcolor: '#3b82f6', color: 'white', fontWeight: 800, textTransform: 'none', borderRadius: 3 }}
            >
              Test Notification
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Settings Grid */}
      <Grid container spacing={2}>
        {NOTIF_CATEGORIES.map((cat) => (
          <Grid item xs={12} sm={6} key={cat.id}>
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                height: '100%',
                '&:hover': { borderColor: '#cbd5e1' },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2.5 }}>
                <Box sx={{ pr: 2 }}>
                  <Typography fontWeight={700} fontSize={15} color="#1e293b">
                    {cat.title}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.3 }}>
                    {cat.desc}
                  </Typography>
                </Box>
                <Switch
                  checked={!!settings[cat.id]}
                  onChange={() => handleToggle(cat.id)}
                  color="primary"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationSettingsPage;

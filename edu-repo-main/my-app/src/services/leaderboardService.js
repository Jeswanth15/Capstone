import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/leaderboard';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

export const getSchoolLeaderboard = async (filter = 'all', currentUserId = null) => {
  try {
    const response = await axios.get(`${API_BASE}/school`, {
      params: { filter, currentUserId },
      ...getConfig(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching school leaderboard:', error);
    throw error;
  }
};

export const getClassLeaderboard = async (filter = 'all', currentUserId = null) => {
  try {
    const response = await axios.get(`${API_BASE}/class`, {
      params: { filter, currentUserId },
      ...getConfig(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching class leaderboard:', error);
    throw error;
  }
};

export const getStudentProfilePreview = async (targetUserId) => {
  try {
    const response = await axios.get(`${API_BASE}/profile/${targetUserId}`, getConfig());
    return response.data;
  } catch (error) {
    console.error('Error fetching student profile preview:', error);
    throw error;
  }
};

export const triggerWeeklyRewards = async () => {
  try {
    const response = await axios.post(`${API_BASE}/trigger-weekly-rewards`, {}, getConfig());
    return response.data;
  } catch (error) {
    console.error('Error triggering weekly rewards:', error);
    throw error;
  }
};

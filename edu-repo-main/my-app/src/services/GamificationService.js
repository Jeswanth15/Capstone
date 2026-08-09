import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/gamification';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

class GamificationService {
    getStatus(userId) {
        return axios.get(`${API_BASE_URL}/status/${userId}`, getConfig());
    }

    awardReward(userId, activity) {
        return axios.post(`${API_BASE_URL}/award/${userId}`, { activity }, getConfig());
    }

    getXpHistory(userId) {
        return axios.get(`${API_BASE_URL}/xp-history/${userId}`, getConfig());
    }

    getCoinHistory(userId) {
        return axios.get(`${API_BASE_URL}/coin-history/${userId}`, getConfig());
    }
}

export default new GamificationService();

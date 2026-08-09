import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/missions';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

class MissionServiceAPI {
    getDailyMissions(userId) {
        return axios.get(`${API_BASE_URL}/daily/${userId}`, getConfig());
    }

    getWeeklyChallenges(userId) {
        return axios.get(`${API_BASE_URL}/weekly/${userId}`, getConfig());
    }

    claimDailyBonus(userId) {
        return axios.post(`${API_BASE_URL}/claim-daily-bonus/${userId}`, {}, getConfig());
    }

    claimWeeklyBonus(userId) {
        return axios.post(`${API_BASE_URL}/claim-weekly-bonus/${userId}`, {}, getConfig());
    }
}

export default new MissionServiceAPI();

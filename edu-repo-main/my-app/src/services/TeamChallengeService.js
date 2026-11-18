import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/team-challenges';
const BASE_HOST = 'http://localhost:8080/api';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

class TeamChallengeService {
  getTeacherClasses(teacherId) {
    return axios.get(`${API_BASE_URL}/teacher/classes?teacherId=${teacherId}`, getConfig());
  }

  getSubjectsForClass(classId, teacherId) {
    return axios.get(`${API_BASE_URL}/teacher/subjects?classId=${classId}&teacherId=${teacherId || ''}`, getConfig());
  }

  getModulesForClassSubject(classSubjectId) {
    return axios.get(`${API_BASE_URL}/teacher/modules?classSubjectId=${classSubjectId}`, getConfig());
  }

  getClassroomStudents(classId) {
    return axios.get(`${API_BASE_URL}/teacher/students?classId=${classId}`, getConfig());
  }

  createChallenge(data) {
    return axios.post(`${API_BASE_URL}`, data, getConfig());
  }

  getTeacherChallenges(teacherId) {
    return axios.get(`${API_BASE_URL}/teacher/list?teacherId=${teacherId}`, getConfig());
  }

  getStudentChallenges(studentId) {
    return axios.get(`${API_BASE_URL}/student/list?studentId=${studentId}`, getConfig());
  }

  getChallengeById(id) {
    return axios.get(`${API_BASE_URL}/${id}`, getConfig());
  }

  getLobbyStatus(id, studentId) {
    return axios.get(`${API_BASE_URL}/${id}/lobby?studentId=${studentId}`, getConfig());
  }

  toggleReady(id, studentId) {
    return axios.post(`${API_BASE_URL}/${id}/lobby/ready?studentId=${studentId}`, {}, getConfig());
  }

  getSessionQuestions(id, studentId) {
    return axios.get(`${API_BASE_URL}/${id}/questions?studentId=${studentId}`, getConfig());
  }

  selectAnswer(id, studentId, questionNumber, selectedOption) {
    return axios.post(
      `${API_BASE_URL}/${id}/answer?studentId=${studentId}&questionNumber=${questionNumber}&selectedOption=${encodeURIComponent(selectedOption)}`,
      {},
      getConfig()
    );
  }

  getSessionAnswers(id, studentId) {
    return axios.get(`${API_BASE_URL}/${id}/answers?studentId=${studentId}`, getConfig());
  }

  submitChallenge(id, studentId) {
    return axios.post(`${API_BASE_URL}/${id}/submit?studentId=${studentId}`, {}, getConfig());
  }

  // --- Phase 4 Gamification & Module Territory Methods ---
  getSubjectModules(subjectId) {
    return axios.get(`${BASE_HOST}/module-capture/subject/${subjectId}`, getConfig());
  }

  getOverallLeaderboard() {
    return axios.get(`${BASE_HOST}/leaderboard/overall`, getConfig());
  }

  getTeamLeaderboard() {
    return axios.get(`${BASE_HOST}/leaderboard/team`, getConfig());
  }

  getUserGamificationProfile(userId) {
    return axios.get(`${BASE_HOST}/gamification/profile/${userId}`, getConfig());
  }
}

const teamChallengeServiceInstance = new TeamChallengeService();
export default teamChallengeServiceInstance;

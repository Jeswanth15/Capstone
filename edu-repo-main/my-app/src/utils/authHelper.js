import {jwtDecode} from "jwt-decode";

export const getDecodedToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const getUserRole = () => {
  const decoded = getDecodedToken();
  return decoded ? decoded.role : null;
};

export const getUserName = () => {
  const decoded = getDecodedToken();
  return decoded ? decoded.name : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.clear();
  window.location.href = "/login";
};

// get school ID
export const getSchoolIdFromToken = () => {
  const decoded = getDecodedToken();
  return decoded?.schoolId || null;
};

// get school name
export const getSchoolNameFromToken = () => {
  const decoded = getDecodedToken();
  return decoded?.schoolName || "Unknown School";
};

// get user ID
export const getUserIdFromToken = () => {
    const decoded = getDecodedToken();
    return decoded?.userId || decoded?.id || null;
};

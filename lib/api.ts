import { API_URL } from "~/constants/config";

// Helper function to get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// User API calls
export const getUserById = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

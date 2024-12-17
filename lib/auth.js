// utils/auth.js
import secureLocalStorage from "react-secure-storage";

export const handleLogin = async (employeeId, password) => {
  console.log("Login parameters:", employeeId, password);

  if (!employeeId || !password) {
    console.log("Both Employee ID and Password are required.");
    return { success: false, error: "Both Employee ID and Password are required." };
  }

  try {
    const response = await fetch("http://10.40.20.93:300/api/Login/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, password }),
    });

    if (response.ok) {
      const data = await response.json();
      secureLocalStorage.setItem("nu", data.username); 
      secureLocalStorage.setItem("die", data.employeeId); 
      secureLocalStorage.setItem("ep", password); 
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.error || "Authentication failed." };
    }
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "Network error occurred." };
  }
};

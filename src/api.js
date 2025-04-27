// src/api.js

export async function getHealthRisk(data) {
    try {
      const response = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) throw new Error("API error");
      return await response.json();
    } catch (err) {
      console.error("API fetch error:", err);
      throw err;
    }
  }
  
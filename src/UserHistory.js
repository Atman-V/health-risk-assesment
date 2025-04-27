import React, { useEffect, useState } from "react";
import axios from "axios";

function UserHistory({ goBack }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        // Fetch all history entries from the backend
        const response = await axios.get("http://localhost:5000/api/history");
        if (response.data.length > 0) {
          setHistoryData(response.data);
        } else {
          setHistoryData([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch history:", err);
        alert("Error fetching user history");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">📜 Previous Health Risk Reports</h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : historyData.length === 0 ? (
        <p className="text-center text-gray-500">No previous records found.</p>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-scroll">
          {historyData.map((entry, index) => (
            <div
              key={index}
              className="border border-gray-300 p-4 rounded-xl shadow hover:shadow-lg transition"
            >
              <p className="text-sm text-gray-600">
                🧑‍⚕️ <strong>{entry.username}</strong> —{" "}
                <em>{new Date(entry.timestamp).toLocaleString()}</em>
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {Object.entries(entry.result).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong>
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside text-sm">
                        {value.map((tip, i) => (
                          <li key={i}>✅ {tip}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-6">
        <button
          onClick={goBack}
          className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
        >
          🔙 Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default UserHistory;

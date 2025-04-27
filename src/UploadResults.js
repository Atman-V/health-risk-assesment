import React from "react";
import RiskChart from "./RiskChart"; // Import the chart component

const UploadResults = ({ riskResult, formData }) => {
  // Prepare chart data
  const chartData = {
    labels: ["Heart", "Diabetes", "Mental", "Obesity"],
    datasets: [
      {
        label: "Risk Level",
        data: [
          riskResult?.heartRisk === "High" ? 100 : riskResult?.heartRisk === "Moderate" ? 70 : 30,
          riskResult?.diabetesRisk === "High" ? 100 : riskResult?.diabetesRisk === "Moderate" ? 70 : 30,
          riskResult?.mentalRisk === "High" ? 100 : riskResult?.mentalRisk === "Moderate" ? 70 : 30,
          riskResult?.obesityRisk === "High" ? 100 : riskResult?.obesityRisk === "Moderate" ? 70 : 30,
        ],
        backgroundColor: ["#FF4136", "#FF851B", "#2ECC40", "#0074D9"],
      },
    ],
  };

  return (
    <div className="result-page">
      <h1>Health Risk Results for {formData.username}</h1>

      {/* Chart for Heart Risk */}
      <div>
        <h2>Heart Risk</h2>
        <RiskChart chartType="bar" chartData={chartData} />
      </div>

      {/* Chart for Diabetes Risk */}
      <div>
        <h2>Diabetes Risk</h2>
        <RiskChart chartType="radar" chartData={chartData} />
      </div>

      {/* Chart for Mental Health Risk */}
      <div>
        <h2>Mental Health Risk</h2>
        <RiskChart chartType="pie" chartData={chartData} />
      </div>

      {/* Chart for Obesity Risk */}
      <div>
        <h2>Obesity Risk</h2>
        <RiskChart chartType="line" chartData={chartData} />
      </div>
    </div>
  );
};

export default UploadResults;

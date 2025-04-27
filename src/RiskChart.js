import React from "react";
import { Bar, Pie, Radar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const RiskChart = ({ chartType, chartData }) => {
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Health Risk Levels",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}%`;
          },
        },
      },
    },
  };

  switch (chartType) {
    case "bar":
      return <Bar data={data} options={options} />;
    case "pie":
      return <Pie data={data} options={options} />;
    case "radar":
      return <Radar data={data} options={options} />;
    case "line":
      return <Line data={data} options={options} />;
    default:
      return null;
  }
};

export default RiskChart;

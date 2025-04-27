import React, { useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import UserHistory from "./UserHistory";



function App() {
  const [page, setPage] = useState("welcome");
  const [riskResult, setRiskResult] = useState(null);
  const [isFromReport, setIsFromReport] = useState(false); // ✅ This is the missing line
  const [showInfo, setShowInfo] = useState(false);

  const goToMain = () => setPage("main");

  const [formData, setFormData] = useState({
    username: "",
    age: "",
    gender: "",
    smoking: "",
    alcohol: "",
    exercise: "",
    sleep: "",
    diet: "",
    weight: "",
    stress: "",
    familyHistory: [],
    symptoms: [],
    bloodPressure: "",
    sugarLevel: "",
    cholesterol: "",
    mentalHealth: "",
    activityLevel: "",
  });
  

  const handleSurveyChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "select-multiple") {
      setFormData({
        ...formData,
        [name]: Array.from(e.target.selectedOptions, (option) => option.value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveChip = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value),
    }));
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
  
    try {
      const payload = {
        ...formData,
        familyHistory: formData.familyHistory.join(","),
        symptoms: formData.symptoms.join(","),
      };
  
      const response = await axios.post("http://localhost:5000/api/survey", payload, {
        headers: { "Content-Type": "application/json" },
      });
  
      const backendResult = response.data.result || response.data;
  
      console.log("✅ AI Prediction Response:", backendResult);
  
      setRiskResult(backendResult);
      setPage("result");
    } catch (err) {
      console.error("❌ Error submitting survey:", err?.response?.data || err.message);
      alert("❌ Failed to submit survey.");
    }
  };
  
  
  
  

  const calculateRiskWithRecommendations = (override = null) => {
    const data = override || formData;
  
    // ✅ Normalize arrays from string inputs if needed (from PDF upload)
    if (typeof data.familyHistory === "string") {
      data.familyHistory = data.familyHistory.split(",").map((x) => x.trim());
    }
    if (typeof data.symptoms === "string") {
      data.symptoms = data.symptoms.split(",").map((x) => x.trim());
    }
  
    let heartRisk = 0, diabetesRisk = 0, mentalRisk = 0, obesityRisk = 0;
  
    const rec = {
      heart: [],
      diabetes: [],
      mental: [],
      obesity: [],
    };
  
    const age = parseInt(data.age);
    const weight = parseFloat(data.weight);
    const bp = parseFloat(data.bloodPressure);
    const sugar = parseFloat(data.sugarLevel);
    const cholesterol = parseFloat(data.cholesterol);
  
    // --- HEART ---
    if (age > 45) {
      heartRisk++;
      rec.heart.push("Consider regular ECG and heart screenings due to age.");
    }
    if (data.smoking === "yes") {
      heartRisk++;
      rec.heart.push("Quitting smoking significantly reduces heart disease risk.");
    }
    if (data.alcohol === "yes") {
      heartRisk++;
      rec.heart.push("Excess alcohol can elevate blood pressure and cholesterol.");
    }
    if (data.exercise === "never") {
      heartRisk++;
      obesityRisk++;
      rec.heart.push("Begin light physical activity like walking.");
      rec.obesity.push("Lack of activity can lead to weight gain.");
    }
    if (bp > 140) {
      heartRisk++;
      rec.heart.push("Monitor blood pressure and reduce salt intake.");
    }
    if (cholesterol > 240) {
      heartRisk++;
      rec.heart.push("Limit fatty foods and increase fiber intake.");
    }
    if (data.familyHistory.includes("heart")) {
      heartRisk++;
      rec.heart.push("Family history indicates higher heart risk. Get screened.");
    }
  
    // --- DIABETES ---
    if (age > 35) {
      diabetesRisk++;
      rec.diabetes.push("Check HbA1c every 6 months after 35.");
    }
    if (weight > 85) {
      diabetesRisk++;
      obesityRisk++;
      rec.diabetes.push("Try portion control and hydration.");
      rec.obesity.push("Cut down on sugary beverages and processed foods.");
    }
    if (sugar > 130) {
      diabetesRisk++;
      rec.diabetes.push("Elevated sugar level. Monitor fasting and postprandial sugar.");
    }
    if (data.diet === "poor") {
      diabetesRisk++;
      obesityRisk++;
      rec.diabetes.push("Reduce sweets and switch to high-fiber meals.");
      rec.obesity.push("Switch to whole grains and vegetables.");
    }
    if (data.familyHistory.includes("diabetes")) {
      diabetesRisk++;
      rec.diabetes.push("Genetic risk. Keep track of sugar regularly.");
    }
  
    // --- MENTAL HEALTH ---
    if (data.sleep === "<5" || data.stress === "high") {
      mentalRisk++;
      rec.mental.push("Poor sleep and high stress? Try guided meditation.");
    }
    if (data.mentalHealth === "yes") {
      mentalRisk++;
      rec.mental.push("Seek help from a counselor or therapist.");
    }
    if (data.symptoms.includes("tired")) {
      mentalRisk++;
      rec.mental.push("Tiredness may be related to poor rest or emotional strain.");
    }
    if (data.symptoms.includes("blurred vision") && sugar > 130) {
      mentalRisk++;
      rec.mental.push("Blurred vision can relate to both stress and sugar imbalance.");
    }
  
    // --- OBESITY ---
    if (data.activityLevel === "low") {
      obesityRisk++;
      rec.obesity.push("Sedentary lifestyle impacts metabolism. Try home workouts.");
    }
    if (data.symptoms.includes("frequent urination") && sugar > 130) {
      diabetesRisk++;
      rec.diabetes.push("Frequent urination is a red flag. Consult a diabetologist.");
    }
  
    const riskLevel = (score) => {
      if (score >= 4) return "High";
      if (score >= 2) return "Moderate";
      return "Low";
    };
  
    return {
      heartRisk: riskLevel(heartRisk),
      diabetesRisk: riskLevel(diabetesRisk),
      mentalRisk: riskLevel(mentalRisk),
      obesityRisk: riskLevel(obesityRisk),
      heartAdvice: rec.heart,
      diabetesAdvice: rec.diabetes,
      mentalAdvice: rec.mental,
      obesityAdvice: rec.obesity,
    };
  };
  
  

  const handleReportUpload = async (e) => {
    const file = e.target.files[0];
    const formDataData = new FormData();
    formDataData.append("file", file);
  
    try {
      const response = await axios.post("http://localhost:5000/api/upload", formDataData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
  
      const extracted = response.data.data;
      const result = response.data.result;
  
      setFormData((prev) => ({
        ...prev,
        ...extracted
      }));
  
      setRiskResult(result);
      setIsFromReport(true);  // 👈 Set flag here
      setPage("result");
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Failed to process the health report.");
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center px-4 py-8">
      {page === "welcome" && (
        <div className="relative flex flex-col justify-center items-center min-h-screen text-center space-y-6 w-full px-6 py-8 max-w-7xl mx-auto">


    {/* Top Line */}
    <div className="w-full border-t border-softBorder mt-20 mb-8"></div>

<h1 className="text-5xl font-extrabold text-hospitalBlue">Health Risk Analysis</h1>

    <p className="text-lg text-lightText">Get started by logging in or registering an account</p>

    <div className="flex gap-4 justify-center">
      <button onClick={() => setPage("login")} className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300">Login</button>
      <button onClick={() => setPage("register")} className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300">Register</button>
    </div>

    {/* Info Toggle Button */}
    <button
      onClick={() => setShowInfo(!showInfo)}
      className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full shadow hover:bg-hospitalBlue transition"
    >
      ℹ️ Info
    </button>

    {/* Info Panel */}
    {showInfo && (
      <div className="mt-6 bg-lightBg border border-softBorder shadow-lg rounded-xl p-6 text-left space-y-4">
        <h3 className="text-xl font-bold text-blue-700">What is Health Risk Assessment?</h3>
        <p className="text-darkText text-sm">
          Health Risk Assessment (HRA) is a preventive approach used to evaluate a person’s current health condition, lifestyle, and symptoms in order to predict possible health risks.
        </p>
        <h4 className="text-lg font-semibold text-hospitalBlue">Why is it introduced?</h4>
        <p className="text-darkText text-sm">
          HRA is introduced to help individuals recognize their health status early and take preventive measures. It can reduce healthcare costs, improve well-being, and promote proactive health decisions.
        </p>
        <div className="border-t pt-2 text-sm text-lightText">
          Created by: <strong>Sabaris J</strong> & <strong>Divyesh R</strong>
        </div>
      </div>
    )}

    {/* Bottom Line */}
    <div className="w-full border-t border-softBorder mt-20 mb-8"></div>

  </div>
)}


      {page === "login" && (
        <div className="bg-lightBg p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-hospitalBlue text-center">Login</h2>
          <input type="text" placeholder="Username" className="w-full border px-4 py-2 rounded-md" />
          <input type="password" placeholder="Password" className="w-full border px-4 py-2 rounded-md" />
          <button onClick={goToMain} className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300">Continue</button>
          <p className="text-sm text-center text-hospitalBlue cursor-pointer" onClick={() => setPage("register")}>Don’t have an account? Register</p>
        </div>
      )}

      {page === "register" && (
        <div className="bg-lightBg p-8 rounded-xl shadow-lg w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-medicalTeal text-center">Register</h2>
          <input type="text" placeholder="Username" className="w-full border px-4 py-2 rounded-md" />
          <input type="password" placeholder="Password" className="w-full border px-4 py-2 rounded-md" />
          <input type="password" placeholder="Re-enter Password" className="w-full border px-4 py-2 rounded-md" />
          <button onClick={goToMain} className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300">Register</button>
          <p className="text-sm text-center text-hospitalBlue cursor-pointer" onClick={() => setPage("login")}>Already have an account? Login</p>
        </div>
      )}

{page === "main" && (
  <div className="text-center space-y-6">
    <h1 className="text-4xl font-bold text-blue-700">Welcome to Your Dashboard</h1>
    <div className="flex flex-col sm:flex-row gap-6">
      <button
        onClick={() => setPage("survey")}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
      >
        📝 Attend Health Risk Survey
      </button>

      <label className="w-full px-8 py-4 bg-orange-500 text-white rounded-2xl cursor-pointer shadow-md hover:scale-105 transition-transform duration-300 text-center">
        📁 Upload Your Recent Health Report
        <input type="file" className="hidden" onChange={handleReportUpload} />
      </label>

      <button
        onClick={() => setPage("history")}
        className="w-full bg-yellow-500 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300"
      >
        🕓 View My History
      </button>
    </div>
  </div>
)}


{page === "survey" && (
  <form onSubmit={handleSurveySubmit} className="bg-lightBg p-8 rounded-xl shadow-lg w-full max-w-2xl space-y-4">
    <h2 className="text-2xl font-bold text-center text-purple-600">Health Risk Survey</h2>

    {/* 👇 Username field here */}
    <input
      name="username"
      placeholder="Your Name"
      value={formData.username}
      onChange={handleSurveyChange}
      className="w-full border px-4 py-2 rounded-md"
      required
    />

    {/* 👇 Continue with other fields */}
    {["age", "gender", "weight", "bloodPressure", "sugarLevel", "cholesterol"].map((field) => (
      <input
        key={field}
        name={field}
        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
        value={formData[field]}
        onChange={handleSurveyChange}
        className="w-full border px-4 py-2 rounded-md"
        required
      />
    ))}


          {/* Family History Multi-Select with Chips */}
          <div>
            <h3 className="text-lg font-semibold">Family History (Multiple)</h3>
            <select
              name="familyHistory"
              multiple
              value={formData.familyHistory}
              onChange={handleSurveyChange}
              className="w-full border px-4 py-2 rounded-md"
            >
              <option value="heart">Heart Disease</option>
              <option value="diabetes">Diabetes</option>
              <option value="obesity">Obesity</option>
              <option value="mental">Mental Health</option>
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.familyHistory.map((item) => (
                <span
                  key={item}
                  onClick={() => handleRemoveChip("familyHistory", item)}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                >
                  {item} ✕
                </span>
              ))}
            </div>
          </div>

          {/* Other Dropdowns */}
          {[
            ["smoking", "Do you smoke?", ["yes", "no"]],
            ["alcohol", "Do you consume alcohol?", ["yes", "no"]],
            ["exercise", "Exercise frequency", ["never", "sometimes", "regular"]],
            ["sleep", "Sleep duration", ["<5", "5-7", ">7"]],
            ["diet", "Diet quality", ["poor", "average", "healthy"]],
            ["stress", "Stress level", ["low", "moderate", "high"]],
            ["mentalHealth", "Anxiety / Depression?", ["yes", "no"]],
            ["activityLevel", "Physical activity level", ["low", "moderate", "high"]],
          ].map(([name, label, options]) => (
            <select
              key={name}
              name={name}
              value={formData[name]}
              onChange={handleSurveyChange}
              className="w-full border px-4 py-2 rounded-md"
            >
              <option value="">{label}</option>
              {options.map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          ))}

          {/* Symptoms Multi-Select with Chips */}
          <div>
            <h3 className="text-lg font-semibold">Symptoms (Multiple)</h3>
            <select
              name="symptoms"
              multiple
              value={formData.symptoms}
              onChange={handleSurveyChange}
              className="w-full border px-4 py-2 rounded-md"
            >
              <option value="tired">Tiredness</option>
              <option value="chest pain">Chest Pain</option>
              <option value="shortness of breath">Shortness of Breath</option>
              <option value="blurred vision">Blurred Vision</option>
              <option value="frequent urination">Frequent Urination</option>
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.symptoms.map((item) => (
                <span
                  key={item}
                  onClick={() => handleRemoveChip("symptoms", item)}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-purple-200"
                >
                  {item} ✕
                </span>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform duration-300">Submit</button>
        </form>
      )}

{page === "result" && riskResult && (
  <div className="relative bg-lightBg p-8 rounded-xl shadow-lg w-full max-w-xl space-y-4 text-center">
    {/* 🎉 Confetti */}
    {["High"].every(level =>
      ![
        riskResult?.heartRisk,
        riskResult?.diabetesRisk,
        riskResult?.mentalRisk,
        riskResult?.obesityRisk,
      ].includes(level)
    ) && (
      <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />
    )}

    {/* Greeting */}
    <h2 className="text-2xl font-bold text-purple-700">Hi {formData.username} 👋</h2>

    {/* Summary Message */}
    {["High"].some(level =>
      [
        riskResult?.heartRisk,
        riskResult?.diabetesRisk,
        riskResult?.mentalRisk,
        riskResult?.obesityRisk,
      ].includes(level)
    ) ? (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow">
        ⚠️ Some of your health indicators show <strong>high risk</strong>. Please pay close attention to the recommendations below.
      </div>
    ) : (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md shadow">
        🎉 You're in great health! Keep up the excellent habits and stay consistent!
      </div>
    )}

    <h3 className="text-xl font-semibold text-darkText mt-4">🩺 Your Risk Evaluation Summary</h3>
    {isFromReport && (
      <p className="text-sm text-lightText mb-2">📄 This result is based on your uploaded health report.</p>
    )}

    <div className="text-left space-y-4 mt-2">
      {["heart", "diabetes", "mental", "obesity"].map((risk) => (
        <div key={risk}>
          <h3 className="text-lg font-bold capitalize">
            {risk} Risk:{" "}
            <span className="text-purple-600">
              {riskResult?.[risk + "Risk"] || "N/A"}
            </span>
          </h3>
          <ul className="list-disc list-inside text-darkText text-sm">
            {(riskResult?.[risk + "Advice"] || []).map((tip, index) => (
              <li key={index}>✅ {tip}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* PDF & Email */}
    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
      <button
        onClick={() => {
          const doc = new jsPDF();
          doc.text(`Health Risk Report for ${formData.username}`, 14, 20);

          const tableData = [
            ["Risk Type", "Level", "Recommendations"],
            ...["heart", "diabetes", "mental", "obesity"].map((risk) => [
              risk,
              riskResult?.[risk + "Risk"] || "N/A",
              (riskResult?.[risk + "Advice"] || []).join("; ")
            ])
          ];

          autoTable(doc, { startY: 30, head: [tableData[0]], body: tableData.slice(1) });
          doc.save(`Health_Report_${formData.username}.pdf`);
        }}
        className="bg-gray-200 text-black px-4 py-2 rounded-md shadow hover:bg-gray-300"
      >
        📄 Export as PDF
      </button>

      <button
        onClick={() => {
          const subject = `Health Risk Report for ${formData.username}`;
          const body = `Hello,\n\nPlease find the health risk report for ${formData.username} below:\n\n` +
            ["heart", "diabetes", "mental", "obesity"].map((risk) =>
              `${risk} Risk: ${riskResult?.[risk + "Risk"] || "N/A"}\nAdvice: ${(riskResult?.[risk + "Advice"] || []).join("; ")}\n\n`
            ).join("") + "\nRegards,\nHealth Risk Evaluation System";

          window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }}
        className="bg-gray-200 text-black px-4 py-2 rounded-md shadow hover:bg-gray-300"
      >
        ✉️ Email This Report
      </button>
    </div>

    <button
      onClick={() => {
        setIsFromReport(false);
        setPage("main");
      }}
      className="mt-6 bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500"
    >
      🔙 Back to Dashboard
    </button>
  </div>
)}

{/* History Page */}
{page === "history" && (
  <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl space-y-6">
    <h2 className="text-3xl font-bold text-blue-700 text-center">📜 </h2>
    <UserHistory goBack={() => setPage("main")} />
    <div className="text-center">
      <button
        onClick={() => setPage("main")}
        className="mt-6 bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
      >
       
      </button>
    </div>
  </div>
)}

</div>
);
}

export default App;
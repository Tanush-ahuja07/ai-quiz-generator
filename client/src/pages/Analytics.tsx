import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { quizAPI } from '../lib/api';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AnalyticsPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string}>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await quizAPI.getAnalytics(roomCode!);
        setAnalytics(data);
        // Try to fetch leaderboard as well
        const lbData = await quizAPI.getLeaderboard(roomCode!);
        setLeaderboard(lbData.leaderboard || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [roomCode]);

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!analytics) return null;

  // Prepare data for charts, handle missing or invalid data
  const statsArr = Array.isArray(analytics.questionWiseStats) ? analytics.questionWiseStats : [];
  const questionLabels = statsArr.map((q: any, idx: number) => `Q${idx + 1}`);
  const correctData = statsArr.map((q: any) => q.correctCount);
  const incorrectData = statsArr.map((q: any) => q.incorrectCount);
  const totalCorrect = correctData.reduce((a: number, b: number) => a + b, 0);
  const totalIncorrect = incorrectData.reduce((a: number, b: number) => a + b, 0);

  // Calculate percentages and best/worst questions
  const percentData = statsArr.map((q: any) => {
    const total = (q.correctCount ?? 0) + (q.incorrectCount ?? 0);
    return {
      correctPercent: total > 0 ? ((q.correctCount / total) * 100).toFixed(1) : '0.0',
      incorrectPercent: total > 0 ? ((q.incorrectCount / total) * 100).toFixed(1) : '0.0',
    };
  });

  // Find best/worst question by correctness
  let bestIdx = -1, worstIdx = -1, maxCorrect = -1, minCorrect = Infinity;
  statsArr.forEach((q: any, idx: number) => {
    if (q.correctCount > maxCorrect) { maxCorrect = q.correctCount; bestIdx = idx; }
    if (q.correctCount < minCorrect) { minCorrect = q.correctCount; worstIdx = idx; }
  });

  const barData = {
    labels: questionLabels,
    datasets: [
      {
        label: 'Correct',
        data: correctData,
        backgroundColor: 'rgba(34,197,94,0.7)',
      },
      {
        label: 'Incorrect',
        data: incorrectData,
        backgroundColor: 'rgba(239,68,68,0.7)',
      },
    ],
  };

  const pieData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [totalCorrect, totalIncorrect],
        backgroundColor: ['#22c55e', '#ef4444'],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Quiz Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-gray-500">Total Attempts</span>
          <span className="text-4xl font-bold text-blue-600 mt-2">{analytics.totalAttempts}</span>
        </div>
        <div className="bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-gray-500">Average Score</span>
          <span className="text-4xl font-bold text-green-600 mt-2">{analytics.averageScore}</span>
        </div>
        <div className="bg-gray-900 rounded-lg shadow p-6">
          <span className="text-gray-500">Best Performer</span>
          <div className="mt-2">
            <span className="font-semibold">{analytics.bestPerformer?.name}</span>
            <span className="ml-2 text-green-600">{analytics.bestPerformer?.score} pts</span>
            <span className="ml-2 text-gray-400">({analytics.bestPerformer?.timeTaken}s)</span>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg shadow p-6">
          <span className="text-gray-500">Worst Performer</span>
          <div className="mt-2">
            <span className="font-semibold">{analytics.worstPerformer?.name}</span>
            <span className="ml-2 text-red-600">{analytics.worstPerformer?.score} pts</span>
            <span className="ml-2 text-gray-400">({analytics.worstPerformer?.timeTaken}s)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Correct vs Incorrect (Pie Chart)</h2>
          <Pie data={pieData} />
        </div>
        <div className="bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Question-wise Stats (Bar Chart)</h2>
          <Bar data={barData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' as const },
              title: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    const idx = context.dataIndex;
                    const correct = correctData[idx];
                    const incorrect = incorrectData[idx];
                    const total = correct + incorrect;
                    const percent = total > 0 ? ((correct / total) * 100).toFixed(1) : '0.0';
                    return `${context.dataset.label}: ${context.parsed.y} (${percent}%)`;
                  }
                }
              }
            },
          }} />
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Question-wise Table</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-900">
              <th className="border px-2 py-1 text-left">Question</th>
              <th className="border px-2 py-1">Correct</th>
              <th className="border px-2 py-1">Incorrect</th>
              <th className="border px-2 py-1">Correct %</th>
              <th className="border px-2 py-1">Incorrect %</th>
            </tr>
          </thead>
          <tbody>
            {statsArr.length === 0 ? (
              <tr>
                <td className="border px-2 py-1" colSpan={5}>No question stats available.</td>
              </tr>
            ) : (
              statsArr.map((q: any, idx: number) => {
                return (
                  <tr key={idx} >
                    <td className="border px-2 py-1">
                      {typeof q.question === 'string' ? q.question : JSON.stringify(q.question)}
                    </td>
                    <td className="border px-2 py-1 text-green-600" title="Number of correct answers">{q.correctCount}</td>
                    <td className="border px-2 py-1 text-red-600" title="Number of incorrect answers">{q.incorrectCount}</td>
                    <td className="border px-2 py-1 text-green-400" title="% of correct answers">{percentData[idx]?.correctPercent}%</td>
                    <td className="border px-2 py-1 text-red-400" title="% of incorrect answers">{percentData[idx]?.incorrectPercent}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <div className="text-center text-gray-400">No leaderboard data available.</div>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-900">
                <th className="border px-2 py-1">Rank</th>
                <th className="border px-2 py-1 text-left">Name</th>
                <th className="border px-2 py-1">Score</th>
                <th className="border px-2 py-1">Time Taken (s)</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry: any, idx: number) => (
                <tr key={idx} className={idx === 0 ? "bg-green-900/30" : ""}>
                  <td className="border px-2 py-1 font-bold">{idx + 1}</td>
                  <td className="border px-2 py-1">{entry.name}</td>
                  <td className="border px-2 py-1">{entry.score}</td>
                  <td className="border px-2 py-1">{entry.timeTaken}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;

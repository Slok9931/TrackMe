import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DSAApiService from "../services/dsaApi";
import type { UserProblem } from "../services/dsaApi";

// Helper to produce a local YYYY-MM-DD date key (avoids UTC shift from toISOString)
const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Custom Date Picker Component
const CustomDatePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null,
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Format date as YYYY-MM-DD in local timezone to avoid timezone offset issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  const clearDate = () => {
    setSelectedDate(null);
    onChange("");
    setIsOpen(false);
  };

  // Update selectedDate when value prop changes
  useEffect(() => {
    if (
      value &&
      value !== (selectedDate ? toLocalDateKey(selectedDate) : undefined)
    ) {
      setSelectedDate(new Date(value));
    } else if (!value) {
      setSelectedDate(null);
    }
  }, [value]);

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-white/15 rounded-xl hover:border-amber-300/50 focus:ring-2 focus:ring-amber-300/70 focus:border-transparent transition-all bg-slate-900/70"
      >
        <span className="flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={selectedDate ? "text-slate-100" : "text-slate-400"}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
        </span>
        <svg
          className={`w-5 h-5 transition-transform text-slate-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[80]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[90] mt-1 bg-slate-900 border border-white/15 rounded-xl shadow-[0_22px_60px_rgba(2,6,23,0.7)] p-4 min-w-80 backdrop-blur-xl">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                    ),
                  )
                }
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-slate-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-slate-100">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                    ),
                  )
                }
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-slate-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-sm font-medium text-slate-400 text-center py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <div key={index} className="aspect-square">
                  {date && (
                    <button
                      type="button"
                      onClick={() => handleDateSelect(date)}
                      className={`w-full h-full text-sm rounded-lg hover:bg-white/10 transition-colors ${
                        isSameDay(date, selectedDate)
                          ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
                          : isToday(date)
                            ? "bg-amber-300/20 text-amber-100 font-semibold"
                            : "text-slate-200"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={clearDate}
                className="text-sm text-slate-300 hover:text-slate-100 px-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  handleDateSelect(today);
                }}
                className="text-sm text-amber-700 hover:text-amber-800 px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors font-medium"
              >
                Today
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface User {
  _id: string;
  name: string;
  email: string;
  googleId: string;
  profilePicture?: string;
}

interface DSADashboardProps {
  user: User;
}

type DateRange =
  | "today"
  | "last_week"
  | "this_month"
  | "last_6_months"
  | "last_year"
  | "custom";

interface ChartData {
  date: string;
  problems: number;
  easy: number;
  medium: number;
  hard: number;
}

interface DifficultyData {
  difficulty: string;
  count: number;
  color: string;
}

const DSADashboard: React.FC<DSADashboardProps> = ({ user }) => {
  const [recentProblems, setRecentProblems] = useState<UserProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] =
    useState<DateRange>("this_month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [difficultyData, setDifficultyData] = useState<DifficultyData[]>([]);
  const [allUserProblems, setAllUserProblems] = useState<UserProblem[]>([]);

  const completedProblems = allUserProblems.filter(
    (problem) => problem.status === "Completed",
  );
  const easyCount = completedProblems.filter(
    (problem) => (problem.problemId as any)?.difficulty === "Easy",
  ).length;
  const mediumCount = completedProblems.filter(
    (problem) => (problem.problemId as any)?.difficulty === "Medium",
  ).length;
  const hardCount = completedProblems.filter(
    (problem) => (problem.problemId as any)?.difficulty === "Hard",
  ).length;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    generateChartData();
  }, [selectedDateRange, customStartDate, customEndDate, allUserProblems]);

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (selectedDateRange) {
      case "today":
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        };
      case "last_week":
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: lastWeek, end: now };
      case "this_month":
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: thisMonth, end: now };
      case "last_6_months":
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return { start: sixMonthsAgo, end: now };
      case "last_year":
        const lastYear = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );
        return { start: lastYear, end: now };
      case "custom":
        return {
          start: customStartDate
            ? new Date(customStartDate)
            : new Date(now.getFullYear(), now.getMonth(), 1),
          end: customEndDate ? new Date(customEndDate) : now,
        };
      default:
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now,
        };
    }
  };

  const generateChartData = () => {
    if (allUserProblems.length === 0) return;

    const { start, end } = getDateRange();
    const filteredProblems = allUserProblems.filter((problem) => {
      if (!problem.date_solved) return false;
      const problemDate = new Date(problem.date_solved);
      return problemDate >= start && problemDate <= end;
    });

    // Generate daily data for chart
    const dailyData = new Map<string, ChartData>();
    const current = new Date(start);

    while (current <= end) {
      const dateStr = toLocalDateKey(current);
      dailyData.set(dateStr, {
        date: dateStr,
        problems: 0,
        easy: 0,
        medium: 0,
        hard: 0,
      });
      current.setDate(current.getDate() + 1);
    }

    // Populate with actual data
    filteredProblems.forEach((problem) => {
      if (problem.status === "Completed" && problem.date_solved) {
        const dateStr = toLocalDateKey(new Date(problem.date_solved));
        const data = dailyData.get(dateStr);
        if (data) {
          data.problems += 1;
          const difficulty = (problem.problemId as any)?.difficulty;
          if (difficulty === "Easy") data.easy += 1;
          else if (difficulty === "Medium") data.medium += 1;
          else if (difficulty === "Hard") data.hard += 1;
        }
      }
    });

    setChartData(
      Array.from(dailyData.values()).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    );

    // Generate difficulty breakdown
    const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };
    filteredProblems.forEach((problem) => {
      if (problem.status === "Completed") {
        const difficulty = (problem.problemId as any)?.difficulty;
        if (difficulty && difficultyCount.hasOwnProperty(difficulty)) {
          difficultyCount[difficulty as keyof typeof difficultyCount] += 1;
        }
      }
    });

    setDifficultyData([
      { difficulty: "Easy", count: difficultyCount.Easy, color: "#10b981" },
      { difficulty: "Medium", count: difficultyCount.Medium, color: "#f59e0b" },
      { difficulty: "Hard", count: difficultyCount.Hard, color: "#ef4444" },
    ]);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch recent problems (latest 5)
      const problemsResponse = await DSAApiService.getUserProblems({
        page: 1,
        limit: 5,
      });
      setRecentProblems(problemsResponse.userProblems);

      // Fetch all problems for charts
      const allProblemsResponse = await DSAApiService.getUserProblems({
        page: 1,
        limit: 1000,
      });
      setAllUserProblems(allProblemsResponse.userProblems);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const DateRangeSelector = () => (
    <div className="relative z-40 rounded-3xl border border-white/15 bg-slate-900/55 p-6 mb-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
      <div className="flex items-center mb-6">
        <span className="text-2xl mr-3">📅</span>
        <h3 className="text-xl font-bold text-white">Analytics Period</h3>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { value: "today", label: "Today", icon: "📅" },
          { value: "last_week", label: "Last Week", icon: "📊" },
          { value: "this_month", label: "This Month", icon: "📈" },
          { value: "last_6_months", label: "Last 6 Months", icon: "📉" },
          { value: "last_year", label: "Last Year", icon: "📋" },
          { value: "custom", label: "Custom Range", icon: "🎯" },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedDateRange(option.value as DateRange)}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
              selectedDateRange === option.value
                ? "bg-amber-300 text-slate-950 shadow-lg shadow-amber-900/30"
                : "bg-slate-950/50 text-slate-200 hover:bg-slate-900/80 border border-white/10"
            }`}
          >
            <span className="mr-2">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>
      {selectedDateRange === "custom" && (
        <div className="bg-slate-950/50 border border-white/10 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                📅 Start Date
              </label>
              <CustomDatePicker
                value={customStartDate}
                onChange={setCustomStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                📅 End Date
              </label>
              <CustomDatePicker
                value={customEndDate}
                onChange={setCustomEndDate}
                placeholder="Select end date"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const LineChart = () => {
    const maxValue = Math.max(...chartData.map((d) => d.problems), 1);
    const chartHeight = 260;
    const chartWidth = 760;
    const leftPadding = 52;
    const rightPadding = 24;
    const topPadding = 20;
    const innerWidth = chartWidth - leftPadding - rightPadding;

    return (
      <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">📈</span>
          <h3 className="text-xl font-bold text-white">
            Problems Solved Over Time
          </h3>
        </div>
        <div className="relative overflow-x-auto" style={{ height: chartHeight + 46 }}>
          <svg
            width="100%"
            height={chartHeight + 40}
            viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1={leftPadding}
                y1={topPadding + ratio * chartHeight}
                x2={chartWidth - rightPadding}
                y2={topPadding + ratio * chartHeight}
                stroke="#334155"
                strokeWidth="1"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <text
                key={ratio}
                x={leftPadding - 12}
                y={topPadding + 6 + ratio * chartHeight}
                textAnchor="end"
                fontSize="12"
                fill="#94a3b8"
              >
                {Math.round((1 - ratio) * maxValue)}
              </text>
            ))}

            {/* Line chart */}
            {chartData.length > 1 && (
              <polyline
                points={chartData
                  .map(
                    (d, i) =>
                      `${leftPadding + (i / (chartData.length - 1)) * innerWidth},${topPadding + chartHeight - (d.problems / maxValue) * chartHeight}`,
                  )
                  .join(" ")}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {chartData.map((d, i) => (
              <circle
                key={d.date}
                cx={
                  leftPadding +
                  (i / Math.max(chartData.length - 1, 1)) *
                    innerWidth
                }
                cy={topPadding + chartHeight - (d.problems / maxValue) * chartHeight}
                r="4"
                fill="#fbbf24"
                className="hover:r-6 transition-all cursor-pointer"
              >
                <title>{`${d.date}: ${d.problems} problems`}</title>
              </circle>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  const BarChart = () => {
    const maxValue = Math.max(
      ...chartData.map((d) => Math.max(d.easy, d.medium, d.hard)),
      1,
    );
    const barWidth = Math.max(20, Math.min(40, 600 / chartData.length));

    return (
      <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">📊</span>
          <h3 className="text-xl font-bold text-white">
            Difficulty Breakdown Over Time
          </h3>
        </div>
        <div className="overflow-x-auto">
          <svg
            width={Math.max(800, chartData.length * (barWidth + 4))}
            height="240"
            className="overflow-visible"
          >
            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <text
                key={ratio}
                x="30"
                y={25 + ratio * 180}
                textAnchor="end"
                fontSize="12"
                fill="#94a3b8"
              >
                {Math.round((1 - ratio) * maxValue)}
              </text>
            ))}

            {/* Bars */}
            {chartData.map((d, i) => {
              const x = 40 + i * (barWidth + 4);
              const easyHeight = (d.easy / maxValue) * 180;
              const mediumHeight = (d.medium / maxValue) * 180;
              const hardHeight = (d.hard / maxValue) * 180;

              return (
                <g key={d.date}>
                  {/* Easy */}
                  <rect
                    x={x}
                    y={200 - easyHeight}
                    width={barWidth / 3}
                    height={easyHeight}
                    fill="#10b981"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <title>{`${d.date}: ${d.easy} Easy`}</title>
                  </rect>
                  {/* Medium */}
                  <rect
                    x={x + barWidth / 3}
                    y={200 - mediumHeight}
                    width={barWidth / 3}
                    height={mediumHeight}
                    fill="#f59e0b"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <title>{`${d.date}: ${d.medium} Medium`}</title>
                  </rect>
                  {/* Hard */}
                  <rect
                    x={x + (2 * barWidth) / 3}
                    y={200 - hardHeight}
                    width={barWidth / 3}
                    height={hardHeight}
                    fill="#ef4444"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <title>{`${d.date}: ${d.hard} Hard`}</title>
                  </rect>
                  {/* Date label */}
                  {i % Math.max(1, Math.floor(chartData.length / 10)) === 0 && (
                    <text
                      x={x + barWidth / 2}
                      y="230"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94a3b8"
                    >
                      {new Date(d.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const PieChart = () => {
    const total = difficultyData.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) {
      return (
        <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">🥧</span>
            <h3 className="text-xl font-bold text-white">
              Difficulty Distribution
            </h3>
          </div>
          <div className="flex items-center justify-center h-40 text-slate-400">
            <div className="text-center">
              <span className="text-4xl mb-2 block">📊</span>
              <p className="text-sm">No data available for selected range</p>
            </div>
          </div>
        </div>
      );
    }

    let currentAngle = 0;
    const radius = 80;
    const centerX = 120;
    const centerY = 100;

    return (
      <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">🥧</span>
          <h3 className="text-xl font-bold text-white">
            Difficulty Distribution
          </h3>
        </div>
        <div className="flex items-center justify-center">
          <svg width="240" height="200">
            {difficultyData.map((d) => {
              if (d.count === 0) return null;

              const percentage = (d.count / total) * 100;
              const angle = (d.count / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              const x1 =
                centerX +
                radius * Math.cos(((startAngle - 90) * Math.PI) / 180);
              const y1 =
                centerY +
                radius * Math.sin(((startAngle - 90) * Math.PI) / 180);
              const x2 =
                centerX + radius * Math.cos(((endAngle - 90) * Math.PI) / 180);
              const y2 =
                centerY + radius * Math.sin(((endAngle - 90) * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                "Z",
              ].join(" ");

              currentAngle += angle;

              return (
                <path
                  key={d.difficulty}
                  d={pathData}
                  fill={d.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${d.difficulty}: ${d.count} (${percentage.toFixed(1)}%)`}</title>
                </path>
              );
            })}

            {/* Center circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r="30"
              fill="white"
              stroke="#e5e7eb"
              strokeWidth="2"
            />
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#334155"
            >
              {total}
            </text>
            <text
              x={centerX}
              y={centerY + 10}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              Total
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          {difficultyData.map((d) => (
            <div key={d.difficulty} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: d.color }}
              ></div>
              <span className="text-sm text-slate-200">
                {d.difficulty}: {d.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-8 py-7 backdrop-blur-xl shadow-[0_24px_70px_rgba(2,6,23,0.65)]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse animation-delay-400"></div>
          </div>
          <p className="text-sm tracking-wide text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-amber-300 text-slate-950 rounded-lg hover:bg-amber-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-10">
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-center mb-10">
          <div className="order-2 xl:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-100 text-sm font-semibold mb-5">
              <span>🧭</span>
              <span>Mission Control Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-base sm:text-lg text-slate-200/90 max-w-2xl mb-6">
              Track every solved challenge, spot your streak patterns, and steer
              your prep like an explorer mapping new territory.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-7">
              <Link
                to="/dsa/add"
                className="bg-amber-300 hover:bg-amber-200 px-6 py-3 rounded-xl transition-all duration-200 font-semibold text-slate-950 shadow-lg shadow-amber-900/30"
              >
                Add Problem ✨
              </Link>
              <Link
                to="/dsa/problems"
                className="border border-white/25 hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-200 font-semibold"
              >
                Explore All Problems
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-slate-300 mb-1">
                  Total Completed
                </p>
                <p className="text-2xl font-extrabold">{completedProblems.length}</p>
              </div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-amber-100/80 mb-1">
                  Current Focus
                </p>
                <p className="text-2xl font-extrabold">{selectedDateRange.replaceAll("_", " ")}</p>
              </div>
              <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-wide text-amber-100/80 mb-1">
                  Hard Wins
                </p>
                <p className="text-2xl font-extrabold">{hardCount}</p>
              </div>
            </div>
          </div>

          <div className="order-1 xl:order-2">
            <div className="relative rounded-[2rem] border border-white/15 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl shadow-[0_30px_80px_rgba(2,6,23,0.65)]">
              <div className="absolute -top-3 -left-3 h-7 px-3 rounded-full bg-amber-300 text-slate-900 text-xs font-black tracking-wider flex items-center">
                TRACKME
              </div>
              <img
                src="/2.png"
                alt="Dashboard explorer mascot"
                className="w-full max-h-[420px] object-contain drop-shadow-[0_30px_65px_rgba(0,0,0,0.6)]"
              />
              <div className="absolute right-4 top-6 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-100 backdrop-blur-md">
                🔥 Build consistency daily
              </div>
              <div className="absolute left-4 bottom-6 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-50 backdrop-blur-md">
                🏆 Level up interview confidence
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="rounded-3xl p-6 border border-white/15 bg-slate-900/55 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Total Solved</p>
                <p className="text-3xl font-bold text-white">{completedProblems.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-300/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 border border-white/15 bg-slate-900/55 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Easy Problems</p>
                <p className="text-3xl font-bold text-emerald-300">{easyCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-300/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🟢</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 border border-white/15 bg-slate-900/55 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Medium Problems</p>
                <p className="text-3xl font-bold text-amber-300">{mediumCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-300/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🟡</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 border border-white/15 bg-slate-900/55 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Hard Problems</p>
                <p className="text-3xl font-bold text-rose-300">{hardCount}</p>
              </div>
              <div className="w-12 h-12 bg-rose-300/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔴</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <DateRangeSelector />

        {/* Charts Section */}
        <div className="space-y-8 mb-10">
          {/* Line Chart */}
          <LineChart />

          {/* Bar Chart and Pie Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <BarChart />
            </div>
            <div>
              <PieChart />
            </div>
          </div>
        </div>

        {/* Recent Problems */}
        <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔥</span>
              <h3 className="text-xl font-bold text-white">
                Recent Problems
              </h3>
            </div>
            <Link
              to="/dsa/problems"
              className="bg-amber-300 text-slate-950 px-4 py-2 rounded-xl hover:bg-amber-200 transition-all duration-200 text-sm font-semibold shadow-lg shadow-amber-900/30 hover:shadow-xl transform hover:scale-105"
            >
              View All Problems →
            </Link>
          </div>

          {recentProblems.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-slate-900/60 to-slate-800/40 border border-white/10 rounded-2xl">
              <div className="text-6xl mb-4">🚀</div>
              <h4 className="text-2xl font-bold text-white mb-3">
                Ready to Start Your DSA Journey?
              </h4>
              <p className="text-slate-300 mb-6 text-lg">
                Add your first problem and begin mastering algorithms!
              </p>
              <Link
                to="/dsa/add"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-300 to-yellow-200 text-slate-950 rounded-2xl hover:from-amber-200 hover:to-yellow-100 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="mr-2">✨</span>
                Add Your First Problem
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProblems.map((userProblem) => {
                const problem = userProblem.problemId as any; // Will be populated
                const difficultyColors = {
                  Easy: "bg-green-100 text-green-800 border-green-200",
                  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
                  Hard: "bg-red-100 text-red-800 border-red-200",
                };
                const statusIcon =
                  userProblem.status === "Completed" ? "✅" : "⏳";

                return (
                  <div
                    key={userProblem._id}
                    className="group p-6 border border-white/15 rounded-2xl hover:border-amber-300/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-slate-900/70 to-slate-900/45"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-xl">{statusIcon}</span>
                          <h4 className="font-bold text-slate-100 text-lg group-hover:text-amber-200 transition-colors">
                            {problem.title}
                          </h4>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full border ${difficultyColors[problem.difficulty as keyof typeof difficultyColors] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                        {problem.topicTags && problem.topicTags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {problem.topicTags.slice(0, 4).map((tag: any) => (
                              <span
                                key={tag.slug}
                                className="px-3 py-1 bg-amber-300/10 text-amber-100 text-xs font-medium rounded-lg border border-amber-200/25"
                              >
                                #{tag.name}
                              </span>
                            ))}
                            {problem.topicTags.length > 4 && (
                              <span className="px-3 py-1 bg-slate-300/10 text-slate-300 text-xs font-medium rounded-lg border border-slate-200/25">
                                +{problem.topicTags.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                        {userProblem.date_solved && (
                          <p className="text-sm text-slate-300">
                            📅 Solved on{" "}
                            {new Date(
                              userProblem.date_solved,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Link
                          to={`/dsa/problems/${userProblem._id}`}
                          className="px-4 py-2 bg-amber-300/20 text-amber-100 rounded-xl hover:bg-amber-300/30 transition-colors text-sm font-semibold text-center"
                        >
                          📝 View Details
                        </Link>
                        {problem && (problem as any).platform ? (
                          <a
                            href={
                              (problem as any).problemUrl ||
                              (userProblem as any).problem_link
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-amber-300/20 text-amber-100 rounded-xl hover:bg-amber-300/30 transition-colors text-sm font-semibold"
                          >
                            {(problem as any).platform === "gfg" ? (
                              <>
                                <img
                                  src="/GFG.png"
                                  alt="GeeksforGeeks"
                                  className="w-5 h-5 rounded-sm"
                                />
                                <span>GeeksforGeeks</span>
                              </>
                            ) : (
                              <>
                                <img
                                  src="/Leetcode.png"
                                  alt="LeetCode"
                                  className="w-5 h-5 rounded-sm"
                                />
                                <span>LeetCode</span>
                              </>
                            )}
                          </a>
                        ) : (
                          <a
                            href={problem.problemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-amber-300/20 text-amber-100 rounded-xl hover:bg-amber-300/30 transition-colors text-sm font-semibold text-center"
                          >
                            🔗 View
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DSADashboard;

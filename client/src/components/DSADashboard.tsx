import { LoadingState } from './ui/loading-state'
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Compass,
  ExternalLink,
  FileText,
  Flame,
  LineChart as LineChartIcon,
  Plus,
  Rocket,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import DSAApiService from "../services/dsaApi";
import type { UserProblem } from "../services/dsaApi";
import { DatePicker } from './ui/date-picker'
import LineChartCard from './dashboard/charts/LineChartCard'
import BarChartCard from './dashboard/charts/BarChartCard'
import PieChartCard from './dashboard/charts/PieChartCard'
import {
  buildDashboardChartData,
  buildDashboardDifficultyBreakdown,
  getDashboardProblemStats,
  type DashboardDateRange,
} from '../lib/utils'

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

interface RangeOption {
  value: DateRange;
  label: string;
  icon: LucideIcon;
}

const DSADashboard: React.FC<DSADashboardProps> = ({ user }) => {
  const [recentProblems, setRecentProblems] = useState<UserProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] =
    useState<DashboardDateRange>("this_month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [allUserProblems, setAllUserProblems] = useState<UserProblem[]>([]);
  const dateRangeOptions: RangeOption[] = [
    { value: "today", label: "Today", icon: CalendarDays },
    { value: "last_week", label: "Last Week", icon: BarChart3 },
    { value: "this_month", label: "This Month", icon: LineChartIcon },
    { value: "last_6_months", label: "Last 6 Months", icon: Calendar },
    { value: "last_year", label: "Last Year", icon: Clock3 },
    { value: "custom", label: "Custom Range", icon: Target },
  ];

  const dashboardStats = useMemo(
    () => getDashboardProblemStats(allUserProblems),
    [allUserProblems],
  );
  const chartData = useMemo(
    () =>
      buildDashboardChartData(
        allUserProblems,
        selectedDateRange,
        customStartDate,
        customEndDate,
      ),
    [allUserProblems, selectedDateRange, customStartDate, customEndDate],
  );
  const difficultyData = useMemo(
    () =>
      buildDashboardDifficultyBreakdown(
        allUserProblems,
        selectedDateRange,
        customStartDate,
        customEndDate,
      ),
    [allUserProblems, selectedDateRange, customStartDate, customEndDate],
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
        <CalendarDays className="w-6 h-6 mr-3 text-amber-300" />
        <h3 className="text-xl font-bold text-white">Analytics Period</h3>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        {dateRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedDateRange(option.value)}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
              selectedDateRange === option.value
                ? "bg-amber-300 text-slate-950 shadow-lg shadow-amber-900/30"
                : "bg-slate-950/50 text-slate-200 hover:bg-slate-900/80 border border-white/10"
            }`}
          >
            <span className="mr-2 inline-flex align-middle">
              <option.icon className="w-4 h-4" />
            </span>
            {option.label}
          </button>
        ))}
      </div>
      {selectedDateRange === "custom" && (
        <div className="bg-slate-950/50 border border-white/10 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Start Date
              </label>
              <DatePicker
                value={customStartDate}
                onChange={setCustomStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                End Date
              </label>
              <DatePicker
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
    return <LineChartCard data={chartData} />;
  };

  const BarChart = () => {
    return <BarChartCard data={chartData} />;
  };

  const PieChart = () => {
    return <PieChartCard data={difficultyData} />;
  };

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-600 mb-4 mx-auto" />
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
              <Compass className="w-4 h-4" />
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
                <span className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Problem
                </span>
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
                <p className="text-2xl font-extrabold">{dashboardStats.completedCount}</p>
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
                <p className="text-2xl font-extrabold">{dashboardStats.hardCount}</p>
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
                <span className="inline-flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Build consistency daily
                </span>
              </div>
              <div className="absolute left-4 bottom-6 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-50 backdrop-blur-md">
                <span className="inline-flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Level up interview confidence
                </span>
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
                <p className="text-3xl font-bold text-white">{dashboardStats.completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-300/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-amber-200" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 border border-white/15 bg-slate-900/55 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Easy Problems</p>
                <p className="text-3xl font-bold text-emerald-500">{dashboardStats.easyCount}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-300/20 rounded-xl flex items-center justify-center">
                <Circle className="w-6 h-6 text-emerald-500 fill-current" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 border border-white/15 bg-slate-900/55 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Medium Problems</p>
                <p className="text-3xl font-bold text-amber-300">{dashboardStats.mediumCount}</p>
              </div>
              <div className="w-12 h-12 bg-amber-300/20 rounded-xl flex items-center justify-center">
                <Circle className="w-6 h-6 text-amber-300 fill-current" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 border border-white/15 bg-slate-900/55 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Hard Problems</p>
                    <p className="text-3xl font-bold text-red-500">{dashboardStats.hardCount}</p>
              </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <Circle className="w-6 h-6 text-red-500 fill-current" />
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
              <Flame className="w-6 h-6 mr-3 text-amber-300" />
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
              <Rocket className="w-14 h-14 text-amber-200 mx-auto mb-4" />
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
                <Plus className="w-5 h-5 mr-2" />
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
                  Hard: "bg-red-200 text-red-950 border-red-400",
                };
                const isCompleted = userProblem.status === "Completed";

                return (
                  <div
                    key={userProblem._id}
                    className="group p-6 border border-white/15 rounded-2xl hover:border-amber-300/40 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-slate-900/70 to-slate-900/45"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                          ) : (
                            <Clock3 className="w-5 h-5 text-amber-300" />
                          )}
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
                            <span className="inline-flex items-center gap-1 mr-1">
                              <CalendarCheck2 className="w-4 h-4" />
                              Solved on
                            </span>{" "}
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
                          <span className="inline-flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            View Details
                          </span>
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
                            <span className="inline-flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" />
                              View
                            </span>
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

import React, { useState, useEffect } from "react";
import DSAApiService from "../services/dsaApi";
import type { UserProblem } from "../services/dsaApi";
import { LoadingState } from "./ui/loading-state";
import { calculateCurrentStreak } from "../lib/utils";
import {
  BarChart3,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  googleId: string;
  profilePicture?: string;
  createdAt: string;
}

interface ProfilePageProps {
  user: User;
  setUser: (user: User | null) => void;
}

interface DayActivity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const [userProblems, setUserProblems] = useState<UserProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<DayActivity[]>([]);
  const [hoveredSection, setHoveredSection] = useState<
    "easy" | "medium" | "hard" | null
  >(null);

  // Use Google profile picture or fallback to generated avatar
  const getProfileImageUrl = () => {
    if (user.profilePicture) {
      return user.profilePicture;
    }
    const initial = user.name.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initial}&background=10b981&color=ffffff&size=200&rounded=true`;
  };

  // Fetch user problems and calculate statistics
  useEffect(() => {
    const fetchUserProblems = async () => {
      try {
        setLoading(true);
        const response = await DSAApiService.getUserProblems({ limit: 1000 });
        setUserProblems(response.userProblems);
        generateActivityData(response.userProblems);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchUserProblems();
  }, []);

  // Generate activity heatmap data
  const generateActivityData = (problems: UserProblem[]) => {
    const activityMap = new Map<string, number>();
    const today = new Date();

    // Show the trailing 1-year window ending on today.
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);
    const endDate = new Date(today);

    // Initialize all days with 0 activity
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toISOString().split("T")[0];
      activityMap.set(key, 0);
    }

    // Count problems solved per day
    problems.forEach((problem) => {
      if (problem.status === "Completed" && problem.date_solved) {
        const date = new Date(problem.date_solved).toISOString().split("T")[0];
        if (activityMap.has(date)) {
          activityMap.set(date, (activityMap.get(date) || 0) + 1);
        }
      }
    });

    // Convert to activity levels (0-4) and sort by date
    const maxActivity = Math.max(...Array.from(activityMap.values()));
    const activities: DayActivity[] = Array.from(activityMap.entries())
      .map(([date, count]) => ({
        date,
        count,
        level:
          maxActivity === 0
            ? 0
            : (Math.min(4, Math.ceil((count / maxActivity) * 4)) as
                | 0
                | 1
                | 2
                | 3
                | 4),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setActivityData(activities);
  };

  // Calculate statistics
  const completedProblems = userProblems.filter(
    (p) => p.status === "Completed",
  );
  const difficultyStats = {
    Easy: completedProblems.filter(
      (p) => (p.problemId as any)?.difficulty === "Easy",
    ).length,
    Medium: completedProblems.filter(
      (p) => (p.problemId as any)?.difficulty === "Medium",
    ).length,
    Hard: completedProblems.filter(
      (p) => (p.problemId as any)?.difficulty === "Hard",
    ).length,
  };

  const totalSolved = completedProblems.length;
  const currentStreak = calculateCurrentStreak(completedProblems);
  const longestStreak = calculateLongestStreak(completedProblems);
  const solvedRate =
    userProblems.length > 0
      ? Math.round((totalSolved / userProblems.length) * 100)
      : 0;
  const activeDays = activityData.filter((day) => day.count > 0).length;
  const memberSinceDate = new Date(user.createdAt);
  const memberSinceLabel = memberSinceDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const activityBadgeLabel =
    totalSolved === 0
      ? "Getting Started"
      : currentStreak > 0
        ? `Active for ${currentStreak} day${currentStreak === 1 ? "" : "s"}`
        : "Active Coder";
  const mostActiveDay =
    activityData.length > 0
      ? activityData.reduce(
          (max, day) => (day.count > max.count ? day : max),
          activityData[0],
        )
      : null;

  const profileMetricCards: Array<{
    label: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    accent: string;
    valueClass: string;
  }> = [
    {
      label: "Streak",
      value: currentStreak,
      description: "Current daily streak",
      icon: Flame,
      accent: "bg-amber-300/20",
      valueClass: "text-amber-100",
    },
    {
      label: "Best Run",
      value: longestStreak,
      description: "Longest streak ever",
      icon: Trophy,
      accent: "bg-blue-300/20",
      valueClass: "text-blue-100",
    },
  ];

  function calculateLongestStreak(problems: UserProblem[]): number {
    if (problems.length === 0) return 0;

    const sortedDates = problems
      .filter((p) => p.date_solved)
      .map((p) => new Date(p.date_solved!).toDateString())
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const uniqueDates = [...new Set(sortedDates)];
    let maxStreak = 0;
    let currentStreakCount = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const prevDate = new Date(uniqueDates[i - 1]);
      const dayDiff =
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        currentStreakCount++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreakCount);
        currentStreakCount = 1;
      }
    }

    return Math.max(maxStreak, currentStreakCount);
  }

  const difficultyArcLength = 283;
  const easyArcLength =
    totalSolved > 0 ? (difficultyStats.Easy / totalSolved) * difficultyArcLength : 0;
  const mediumArcLength =
    totalSolved > 0
      ? (difficultyStats.Medium / totalSolved) * difficultyArcLength
      : 0;
  const hardArcLength =
    totalSolved > 0 ? (difficultyStats.Hard / totalSolved) * difficultyArcLength : 0;

  // Activity heatmap component
  const ActivityHeatmap = () => {
    const getColor = (level: number) => {
      switch (level) {
        case 0:
          return "bg-slate-800";
        case 1:
          return "bg-emerald-950";
        case 2:
          return "bg-emerald-900";
        case 3:
          return "bg-emerald-600";
        case 4:
          return "bg-emerald-400";
        default:
          return "bg-slate-800";
      }
    };

    // Create a 2D grid: 7 rows (days of week) x ~53 columns (weeks)
    const createWeeklyGrid = () => {
      if (activityData.length === 0) return [];

      const grid: (DayActivity | null)[][] = Array.from(
        { length: 7 },
        () => [],
      );
      const startDate = new Date(activityData[0].date);
      const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Fill the first week with null values before the start date
      for (let i = 0; i < startDayOfWeek; i++) {
        grid[i].push(null);
      }

      // Fill the grid with activity data
      activityData.forEach((day, index) => {
        const dayOfWeek = (startDayOfWeek + index) % 7;
        grid[dayOfWeek].push(day);
      });

      // Ensure all rows have the same length by padding with nulls
      const maxLength = Math.max(...grid.map((row) => row.length));
      grid.forEach((row) => {
        while (row.length < maxLength) {
          row.push(null);
        }
      });

      return grid;
    };

    const weeklyGrid = createWeeklyGrid();
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekCount = weeklyGrid[0]?.length || 0;

    // Generate month labels
    const getMonthLabels = () => {
      if (activityData.length === 0) return [];

      const labels: { month: string; position: number }[] = [];
      const seenMonths = new Set<number>();

      for (let week = 0; week < (weeklyGrid[0]?.length || 0); week++) {
        // Find the first Sunday (or first available day) in this week
        let dayInWeek = null;
        for (let day = 0; day < 7; day++) {
          if (weeklyGrid[day] && weeklyGrid[day][week]) {
            dayInWeek = weeklyGrid[day][week];
            break;
          }
        }

        if (dayInWeek) {
          const date = new Date(dayInWeek.date);
          const monthIndex = date.getMonth(); // 0-11 (Jan-Dec)
          const monthName = date.toLocaleDateString("en-US", {
            month: "short",
          });

          // Add month label at the beginning of each month
          if (!seenMonths.has(monthIndex) && date.getDate() <= 7) {
            labels.push({
              month: monthName,
              position: week,
            });
            seenMonths.add(monthIndex);
          }
        }
      }

      // Return labels in the order they appear in the grid (by position)
      return labels.sort((a, b) => a.position - b.position);
    };

    const monthLabels = getMonthLabels();

    return (
      <div className="space-y-4 text-slate-300">
        {/* Month labels */}
        <div
          className="relative ml-16 w-full"
          style={{
            height: "24px",
          }}
        >
          {monthLabels.map((label, index) => (
            <span
              key={index}
              className="absolute text-sm font-medium text-slate-400"
              style={{ left: `${weekCount > 0 ? (label.position / weekCount) * 100 : 0}%` }}
            >
              {label.month}
            </span>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex w-full items-start">
          {/* Day labels */}
          <div className="mr-4 mt-4 flex h-[150px] flex-col justify-between">
            {dayLabels.map((day, index) => (
              <span
                key={index}
                className="text-sm font-medium leading-none text-slate-400"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Activity squares */}
          <div className="min-w-0 flex-1 overflow-x-hidden p-2">
            <div
              className="grid w-full gap-x-[3px]"
              style={{
                gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))`,
              }}
            >
              {weeklyGrid[0] &&
                weeklyGrid[0].map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col items-stretch gap-y-[3px]">
                    {weeklyGrid.map((dayRow, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`aspect-square w-full cursor-pointer rounded-sm transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-emerald-400 ${
                          dayRow[weekIndex]
                            ? getColor(dayRow[weekIndex]!.level)
                            : "bg-slate-800"
                        }`}
                        title={
                          dayRow[weekIndex]
                            ? `${dayRow[weekIndex]!.date}: ${dayRow[weekIndex]!.count} problem(s) solved`
                            : ""
                        }
                      />
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="ml-16 mt-4 flex items-center justify-between text-sm text-slate-400">
          <span className="font-medium">Less</span>
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-4 h-4 rounded-sm ${getColor(level)}`}
              />
            ))}
          </div>
          <span className="font-medium">More</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative mx-auto px-4 py-6 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-white/15 bg-slate-900/55 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src={getProfileImageUrl()}
                  alt={`${user.name}'s profile`}
                  className="h-20 w-20 rounded-full border-4 border-amber-500 shadow-[0_18px_40px_rgba(2,6,23,0.55)]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${user.name.charAt(0).toUpperCase()}&background=10b981&color=ffffff&size=200&rounded=true`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-400">
                  <svg
                    className="h-3 w-3 text-slate-950"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-100">
                  <Target className="h-3.5 w-3.5" />
                  Profile Overview
                </div>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-50 sm:text-4xl">
                  {user.name}
                </h1>
                <p className="mt-2 text-sm text-slate-400 sm:text-base">
                  {user.email}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {activityBadgeLabel}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                    <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
                    Member since {memberSinceLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="grid grid-cols-2 gap-3">
                {profileMetricCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-white/15 bg-slate-950/55 p-4 shadow-[0_16px_35px_rgba(2,6,23,0.35)] backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {card.label}
                          </p>
                          <p
                            className={`mt-2 text-3xl font-black ${card.valueClass}`}
                          >
                            {card.value}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {card.description}
                          </p>
                        </div>
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.accent}`}
                        >
                          <Icon className="h-5 w-5 text-amber-100" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col items-center">
                <div className="relative mb-4 h-32 w-64 group">
                  <svg viewBox="0 0 240 120" className="h-full w-full">
                    {/* Outer background ring */}
                    <path
                      d="M 30 100 A 90 90 0 0 1 210 100"
                      stroke="#f3f4f6"
                      strokeWidth="20"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Inner shadow effect */}
                    <path
                      d="M 35 95 A 85 85 0 0 1 205 95"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                    />

                    {/* Easy section - Green */}
                    {difficultyStats.Easy > 0 && (
                      <path
                        d="M 30 100 A 90 90 0 0 1 210 100"
                        stroke="#10b981"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(difficultyStats.Easy / totalSolved) * 283} 283`}
                        className="transition-all duration-300 hover:stroke-[20] cursor-pointer"
                      />
                    )}

                    {/* Medium section - Yellow */}
                    {difficultyStats.Medium > 0 && (
                      <path
                        d="M 30 100 A 90 90 0 0 1 210 100"
                        stroke="#f59e0b"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(difficultyStats.Medium / totalSolved) * 283} 283`}
                        strokeDashoffset={`-${(difficultyStats.Easy / totalSolved) * 283}`}
                        className="transition-all duration-300 hover:stroke-[20] cursor-pointer"
                      />
                    )}

                    {/* Hard section - Red */}
                    {difficultyStats.Hard > 0 && (
                      <path
                        d="M 30 100 A 90 90 0 0 1 210 100"
                        stroke="#ef4444"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(difficultyStats.Hard / totalSolved) * 283} 283`}
                        strokeDashoffset={`-${((difficultyStats.Easy + difficultyStats.Medium) / totalSolved) * 283}`}
                        className="transition-all duration-300 hover:stroke-[20] cursor-pointer"
                      />
                    )}

                    {/* Gradient overlay for depth */}
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Invisible arc hit areas that match each visible segment */}
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 120">
                    {difficultyStats.Easy > 0 && (
                      <path
                        d="M 30 100 A 90 90 0 0 1 210 100"
                        stroke="transparent"
                        strokeWidth="26"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${easyArcLength} ${difficultyArcLength}`}
                        onMouseEnter={() => setHoveredSection("easy")}
                        onMouseLeave={() => setHoveredSection(null)}
                        style={{ pointerEvents: "stroke" }}
                      />
                    )}

                    {difficultyStats.Medium > 0 && (
                      <path
                        d="M 30 100 A 90 90 0 0 1 210 100"
                        stroke="transparent"
                        strokeWidth="26"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${mediumArcLength} ${difficultyArcLength}`}
                        strokeDashoffset={`-${easyArcLength}`}
                        onMouseEnter={() => setHoveredSection("medium")}
                        onMouseLeave={() => setHoveredSection(null)}
                        style={{ pointerEvents: "stroke" }}
                      />
                    )}

                    {difficultyStats.Hard > 0 && (
                      <path
                        d="M 30 100 A 90 90 0 0 1 210 100"
                        stroke="transparent"
                        strokeWidth="26"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${hardArcLength} ${difficultyArcLength}`}
                        strokeDashoffset={`-${easyArcLength + mediumArcLength}`}
                        onMouseEnter={() => setHoveredSection("hard")}
                        onMouseLeave={() => setHoveredSection(null)}
                        style={{ pointerEvents: "stroke" }}
                      />
                    )}
                  </svg>

                  {/* Center statistics */}
                  <div className="pointer-events-none absolute inset-0 mt-4 flex flex-col items-center justify-center">
                    <div className="mb-1 text-4xl font-black text-slate-50 transition-all duration-300">
                      {hoveredSection === "easy"
                        ? difficultyStats.Easy
                        : hoveredSection === "medium"
                          ? difficultyStats.Medium
                          : hoveredSection === "hard"
                            ? difficultyStats.Hard
                            : totalSolved}
                    </div>
                    <div className="text-sm font-medium text-slate-400 transition-all duration-300">
                      {hoveredSection === "easy"
                        ? "Easy Problems"
                        : hoveredSection === "medium"
                          ? "Medium Problems"
                          : hoveredSection === "hard"
                            ? "Hard Problems"
                            : "Problems Solved"}
                    </div>
                    {totalSolved > 0 && !hoveredSection && (
                      <div className="mt-1 text-xs text-slate-500 transition-all duration-300">
                        {Math.round(
                          (totalSolved /
                            (totalSolved +
                              (userProblems.length - totalSolved))) *
                            100,
                        )}
                        % completion
                      </div>
                    )}
                    {hoveredSection && (
                      <div className="mt-1 text-xs text-slate-500 transition-all duration-300">
                        {hoveredSection === "easy"
                          ? Math.round(
                              (difficultyStats.Easy / totalSolved) * 100,
                            )
                          : hoveredSection === "medium"
                            ? Math.round(
                                (difficultyStats.Medium / totalSolved) * 100,
                              )
                            : hoveredSection === "hard"
                              ? Math.round(
                                  (difficultyStats.Hard / totalSolved) * 100,
                                )
                              : 0}
                        % of total
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4 flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm" />
                    <span className="text-xs font-medium text-slate-400">
                      Easy
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {difficultyStats.Easy}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-amber-300 shadow-sm" />
                    <span className="text-xs font-medium text-slate-400">
                      Medium
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {difficultyStats.Medium}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-rose-400 shadow-sm" />
                    <span className="text-xs font-medium text-slate-400">
                      Hard
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {difficultyStats.Hard}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <section className="rounded-[2rem] border border-white/15 bg-slate-900/55 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  <Flame className="h-3.5 w-3.5 text-amber-300" />
                  Coding Activity
                </div>
                <h3 className="mt-3 text-xl font-bold text-slate-50">
                  Activity heatmap
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {totalSolved} problems solved in {new Date().getFullYear()}
                </p>
              </div>
              <div className="hidden rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-right sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  Completion
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-100">
                  {solvedRate}%
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-x-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <ActivityHeatmap />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[2rem] border border-white/15 bg-slate-900/55 p-5 sm:p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                <BarChart3 className="h-5 w-5 text-amber-300" />
                <h3 className="text-lg font-semibold text-slate-50">
                  Performance Insights
                </h3>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Overall Completion Rate
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-slate-50">
                        {solvedRate}%
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        Solved vs tracked problems
                      </p>
                    </div>
                    <Target className="h-10 w-10 text-amber-300" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          Weekly Average
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-50">
                          {Math.max(0, Math.round(totalSolved / 52))}
                        </p>
                        <p className="text-xs text-slate-500">
                          problems per week
                        </p>
                      </div>
                      <Clock3 className="h-8 w-8 text-blue-300" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          Most Active Day
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-50">
                          {mostActiveDay
                            ? new Date(mostActiveDay.date).toLocaleDateString(
                                "en-US",
                                { weekday: "short" },
                              )
                            : "N/A"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {mostActiveDay
                            ? `${mostActiveDay.count} solves`
                            : "No activity yet"}
                        </p>
                      </div>
                      <CalendarCheck2 className="h-8 w-8 text-emerald-300" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          Active Days
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-50">
                          {activeDays}
                        </p>
                        <p className="text-xs text-slate-500">days this year</p>
                      </div>
                      <CalendarDays className="h-8 w-8 text-amber-300" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          Hard Wins
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-50">
                          {difficultyStats.Hard}
                        </p>
                        <p className="text-xs text-slate-500">
                          hard problems solved
                        </p>
                      </div>
                      <Trophy className="h-8 w-8 text-rose-300" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
      </main>
    </div>
  );
};

export default ProfilePage;

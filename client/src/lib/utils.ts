import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UserProblem } from "../services/dsaApi";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type DashboardDateRange = "today" | "last_week" | "this_month" | "last_6_months" | "last_year" | "custom";

export interface DashboardDateRangeBounds {
  start: Date;
  end: Date;
}

export interface DashboardChartDataPoint {
  date: string;
  problems: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface DashboardDifficultyDataPoint {
  difficulty: string;
  count: number;
  color: string;
}

export interface DashboardProblemStats {
  completedCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

const DASHBOARD_DIFFICULTY_COLORS = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#ef4444",
} as const;

export function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date(value);
  }

  return new Date(year, month - 1, day);
}

export function getDashboardDateRange(
  selectedDateRange: DashboardDateRange,
  customStartDate: string,
  customEndDate: string,
): DashboardDateRangeBounds {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (selectedDateRange) {
    case "today":
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      };
    case "last_week": {
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: lastWeek, end: now };
    }
    case "this_month": {
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: thisMonth, end: now };
    }
    case "last_6_months": {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      return { start: sixMonthsAgo, end: now };
    }
    case "last_year": {
      const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );
      return { start: lastYear, end: now };
    }
    case "custom":
      return {
        start: customStartDate
          ? parseLocalDateKey(customStartDate)
          : new Date(now.getFullYear(), now.getMonth(), 1),
        end: customEndDate ? parseLocalDateKey(customEndDate) : now,
      };
    default:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      };
  }
}

function isCompletedProblem(problem: UserProblem) {
  return problem.status === "Completed" && Boolean(problem.date_solved);
}

function isProblemWithinRange(
  problem: UserProblem,
  start: Date,
  end: Date,
) {
  if (!isCompletedProblem(problem) || !problem.date_solved) return false;

  const problemDate = new Date(problem.date_solved);
  return problemDate >= start && problemDate <= end;
}

export function buildDashboardChartData(
  allUserProblems: UserProblem[],
  selectedDateRange: DashboardDateRange,
  customStartDate: string,
  customEndDate: string,
) {
  const { start, end } = getDashboardDateRange(
    selectedDateRange,
    customStartDate,
    customEndDate,
  );

  const dailyData = new Map<string, DashboardChartDataPoint>();
  const current = new Date(start);

  while (current <= end) {
    const date = toLocalDateKey(current);
    dailyData.set(date, {
      date,
      problems: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    });
    current.setDate(current.getDate() + 1);
  }

  allUserProblems.forEach((problem) => {
    if (!isProblemWithinRange(problem, start, end) || !problem.date_solved) {
      return;
    }

    const date = toLocalDateKey(new Date(problem.date_solved));
    const data = dailyData.get(date);

    if (!data) return;

    data.problems += 1;
    const difficulty = (problem.problemId as any)?.difficulty;

    if (difficulty === "Easy") data.easy += 1;
    else if (difficulty === "Medium") data.medium += 1;
    else if (difficulty === "Hard") data.hard += 1;
  });

  return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function buildDashboardDifficultyBreakdown(
  allUserProblems: UserProblem[],
  selectedDateRange: DashboardDateRange,
  customStartDate: string,
  customEndDate: string,
) {
  const { start, end } = getDashboardDateRange(
    selectedDateRange,
    customStartDate,
    customEndDate,
  );

  const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };

  allUserProblems.forEach((problem) => {
    if (!isProblemWithinRange(problem, start, end)) return;

    const difficulty = (problem.problemId as any)?.difficulty;
    if (difficulty && difficultyCount.hasOwnProperty(difficulty)) {
      difficultyCount[difficulty as keyof typeof difficultyCount] += 1;
    }
  });

  return [
    { difficulty: "Easy", count: difficultyCount.Easy, color: DASHBOARD_DIFFICULTY_COLORS.Easy },
    { difficulty: "Medium", count: difficultyCount.Medium, color: DASHBOARD_DIFFICULTY_COLORS.Medium },
    { difficulty: "Hard", count: difficultyCount.Hard, color: DASHBOARD_DIFFICULTY_COLORS.Hard },
  ];
}

export function getDashboardProblemStats(allUserProblems: UserProblem[]): DashboardProblemStats {
  const completedProblems = allUserProblems.filter((problem) => problem.status === "Completed");

  const easyCount = completedProblems.filter(
    (problem) => (problem.problemId as any)?.difficulty === "Easy",
  ).length;
  const mediumCount = completedProblems.filter(
    (problem) => (problem.problemId as any)?.difficulty === "Medium",
  ).length;
  const hardCount = completedProblems.filter(
    (problem) => (problem.problemId as any)?.difficulty === "Hard",
  ).length;

  return {
    completedCount: completedProblems.length,
    easyCount,
    mediumCount,
    hardCount,
  };
}

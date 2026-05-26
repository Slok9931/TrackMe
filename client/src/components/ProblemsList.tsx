import React, { useState, useEffect } from "react";
import DSAApiService from "../services/dsaApi";
import type { UserProblem, PaginationInfo } from "../services/dsaApi";
import { DatePicker } from "./ui/date-picker";
import { Dropdown } from "./ui/dropdown";
import { EmptyState } from "./problems/EmptyState";
import { ErrorState } from "./problems/ErrorState";
import { LoadingState } from "./ui/loading-state";
import { RevisionModal } from "./problems/RevisionModal";
import { DeleteModal } from "./problems/DeleteModal";
import { ProblemsTable } from "./problems/ProblemsTable";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
} from "lucide-react";

// using shared Dropdown component from ./ui/dropdown

const ProblemsList: React.FC = () => {
  const [problems, setProblems] = useState<UserProblem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Todo" | "Completed"
  >("All");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "All" | "Easy" | "Medium" | "Hard"
  >("All");
  const [platformFilter, setPlatformFilter] = useState<
    "All" | "leetcode" | "gfg"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Revision modal states
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<UserProblem | null>(
    null,
  );
  const [newRevisionNote, setNewRevisionNote] = useState("");
  const [addingRevision, setAddingRevision] = useState(false);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<UserProblem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, [
    statusFilter,
    difficultyFilter,
    platformFilter,
    searchQuery,
    dateFromFilter,
    dateToFilter,
    currentPage,
  ]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== "All") params.status = statusFilter;
      if (difficultyFilter !== "All") params.difficulty = difficultyFilter;
      if (platformFilter !== "All") params.platform = platformFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (dateFromFilter) params.dateFrom = dateFromFilter;
      if (dateToFilter) params.dateTo = dateToFilter;

      const response = await DSAApiService.getUserProblems(params);
      setProblems(response.userProblems);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error("Error fetching problems:", error);
      setError("Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    userProblemId: string,
    newStatus: "Todo" | "Completed",
  ) => {
    try {
      // Optimistic update - update UI immediately
      setProblems((prevProblems: UserProblem[]) =>
        prevProblems.map((problem: UserProblem) =>
          problem._id === userProblemId
            ? {
                ...problem,
                status: newStatus,
                date_solved:
                  newStatus === "Completed"
                    ? new Date().toISOString()
                    : undefined,
              }
            : problem,
        ),
      );

      // Then update the backend
      await DSAApiService.updateUserProblem(userProblemId, {
        status: newStatus,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      // Revert optimistic update on error
      setProblems((prevProblems: UserProblem[]) =>
        prevProblems.map((problem: UserProblem) =>
          problem._id === userProblemId
            ? {
                ...problem,
                status: newStatus === "Todo" ? "Completed" : "Todo",
                date_solved:
                  newStatus === "Todo" ? new Date().toISOString() : undefined,
              }
            : problem,
        ),
      );
      alert("Failed to update status");
    }
  };

  const handleDeleteClick = (userProblem: UserProblem) => {
    setProblemToDelete(userProblem);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!problemToDelete) return;

    const userProblemId = problemToDelete._id;
    const removedProblem = problemToDelete;

    try {
      setDeleting(true);

      // Optimistic update - remove from UI immediately
      setProblems((prevProblems: UserProblem[]) =>
        prevProblems.filter(
          (problem: UserProblem) => problem._id !== userProblemId,
        ),
      );

      // Then update the backend
      await DSAApiService.deleteUserProblem(userProblemId);

      // Close modal and reset state
      setDeleteModalOpen(false);
      setProblemToDelete(null);
    } catch (error: any) {
      console.error("Error deleting problem:", error);
      // Revert optimistic update on error - add the problem back
      setProblems((prevProblems: UserProblem[]) => [
        ...prevProblems,
        removedProblem,
      ]);
      alert("Failed to delete problem");
    } finally {
      setDeleting(false);
    }
  };

  const handleRevisionClick = (userProblem: UserProblem) => {
    setSelectedProblem(userProblem);
    setRevisionModalOpen(true);
  };

  const handleAddRevision = async () => {
    if (!selectedProblem || !newRevisionNote.trim()) return;

    try {
      setAddingRevision(true);
      await DSAApiService.addRevision(
        selectedProblem._id,
        newRevisionNote.trim(),
      );

      // Calculate next revision number
      const nextRevisionNo = selectedProblem.revision_history.length + 1;
      const newRevision = {
        revision_no: nextRevisionNo,
        revision_date: new Date().toISOString(),
        revision_notes: newRevisionNote.trim(),
      };

      // Update the local state to reflect the new revision
      setProblems((prevProblems) =>
        prevProblems.map((p) =>
          p._id === selectedProblem._id
            ? {
                ...p,
                revision_history: [...p.revision_history, newRevision],
              }
            : p,
        ),
      );

      // Update selected problem for modal
      setSelectedProblem((prev) =>
        prev
          ? {
              ...prev,
              revision_history: [...prev.revision_history, newRevision],
            }
          : null,
      );

      setNewRevisionNote("");
    } catch (error: any) {
      console.error("Error adding revision:", error);
      alert("Failed to add revision");
    } finally {
      setAddingRevision(false);
    }
  };

  if (loading) {
    return <LoadingState message='Loading problems...' />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#07111f] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          <div className="flex items-center justify-center md:col-span-1 md:justify-start">
            <img
              src="/3.png"
              alt="Problem list mascot"
              loading="lazy"
              className="w-full max-h-[420px] object-contain drop-shadow-[0_30px_65px_rgba(0,0,0,0.6)]"
            />
          </div>
          <div className="md:col-span-2">
            <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold text-slate-50 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-amber-300" />
                My Problems
              </h2>
              <p className="text-slate-400 mt-2 text-sm">
                Track and master your DSA problem-solving journey
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative z-20 rounded-3xl border border-white/15 bg-slate-900/55 p-6 mb-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-amber-300" />
              <span className="text-lg font-semibold text-slate-100">
                Search & Filter
              </span>
            </div>
            <button
              onClick={() => {
                setStatusFilter("All");
                setDifficultyFilter("All");
                setPlatformFilter("All");
                setSearchQuery("");
                setDateFromFilter("");
                setDateToFilter("");
                setCurrentPage(1);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Reset All
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Search Problems
            </label>
            <div className="relative">
              <Search
                className="absolute inset-y-0 left-0 ml-3 w-4 h-4 text-slate-400 flex-shrink-0"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by problem title..."
                className="w-full pl-10 pr-4 py-3 text-sm border border-white/15 rounded-xl bg-slate-800/50 text-slate-100 placeholder-slate-500 transition-all hover:border-amber-300/40 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/40 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-amber-300 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Status
              </label>
              <Dropdown
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value as any);
                  setCurrentPage(1);
                }}
                placeholder="All Status"
                options={[
                  { value: "All", label: "All Status" },
                  { value: "Todo", label: "Todo", icon: "📋" },
                  { value: "Completed", label: "Completed", icon: "✅" },
                ]}
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Difficulty
              </label>
              <Dropdown
                value={difficultyFilter}
                onChange={(value) => {
                  setDifficultyFilter(value as any);
                  setCurrentPage(1);
                }}
                placeholder="All Levels"
                options={[
                  { value: "All", label: "All Levels" },
                  { value: "Easy", label: "Easy", icon: "🟢" },
                  { value: "Medium", label: "Medium", icon: "🟡" },
                  { value: "Hard", label: "Hard", icon: "🔴" },
                ]}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                From Date
              </label>
              <div className="space-y-2">
                <DatePicker
                  value={dateFromFilter}
                  onChange={(value) => {
                    setDateFromFilter(value);
                    setCurrentPage(1);
                  }}
                  placeholder="Select date"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                To Date
              </label>
              <div className="space-y-2">
                <DatePicker
                  value={dateToFilter}
                  onChange={(value) => {
                    setDateToFilter(value);
                    setCurrentPage(1);
                  }}
                  placeholder="Select date"
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(statusFilter !== "All" ||
            difficultyFilter !== "All" ||
            searchQuery ||
            dateFromFilter ||
            dateToFilter) && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-400">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {statusFilter !== "All" && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-300/15 text-amber-200 border border-amber-300/30">
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter("All")}
                        className="ml-1.5 text-amber-300 hover:text-amber-100"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {difficultyFilter !== "All" && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-300/15 text-emerald-200 border border-emerald-300/30">
                      Difficulty: {difficultyFilter}
                      <button
                        onClick={() => setDifficultyFilter("All")}
                        className="ml-1.5 text-emerald-300 hover:text-emerald-100"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-300/15 text-blue-200 border border-blue-300/30">
                      Search: {searchQuery}
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-1.5 text-blue-300 hover:text-blue-100"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {(dateFromFilter || dateToFilter) && (
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-300/15 text-orange-200 border border-orange-300/30">
                      Date:{" "}
                      {dateFromFilter &&
                        new Date(dateFromFilter).toLocaleDateString()}
                      {dateFromFilter && dateToFilter && " - "}
                      {dateToFilter &&
                        new Date(dateToFilter).toLocaleDateString()}
                      <button
                        onClick={() => {
                          setDateFromFilter("");
                          setDateToFilter("");
                        }}
                        className="ml-1.5 text-orange-300 hover:text-orange-100"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
        </div>

        {/* Problems Table */}
        {error ? (
          <ErrorState message={error} onRetry={fetchProblems} />
        ) : problems.length === 0 ? (
          <EmptyState
            title="No problems found"
            description={
              statusFilter !== "All" ||
              difficultyFilter !== "All" ||
              platformFilter !== "All"
                ? "Try adjusting your filters or add some problems to get started."
                : "Start tracking your DSA journey by adding your first problem."
            }
            hasFilters={
              statusFilter !== "All" ||
              difficultyFilter !== "All" ||
              platformFilter !== "All"
            }
            showAddButton
          />
        ) : (
          <ProblemsTable
            problems={problems}
            onStatusUpdate={handleStatusUpdate}
            onRevisionClick={handleRevisionClick}
            onDeleteClick={handleDeleteClick}
          />
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="rounded-3xl border border-white/15 bg-slate-900/55 p-6 mt-8 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-300">
                Showing{" "}
                <span className="font-semibold text-slate-100">
                  {(currentPage - 1) * 10 + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-100">
                  {Math.min(currentPage * 10, pagination.totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-100">
                  {pagination.totalItems}
                </span>{" "}
                problems
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-300 border border-white/15 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all hover:border-amber-300/40 disabled:border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-2" />
                </button>

                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm text-slate-300 border border-white/15 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all hover:border-amber-300/40 disabled:border-white/10"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let page;
                      if (pagination.totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        page = pagination.totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm border rounded-lg transition-all ${
                            currentPage === page
                              ? "bg-amber-300/20 text-amber-200 border-amber-300/40"
                              : "text-slate-300 border-white/15 hover:bg-white/5 hover:border-amber-300/40"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-2 text-sm text-slate-300 border border-white/15 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all hover:border-amber-300/40 disabled:border-white/10"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 text-slate-300 border border-white/15 rounded-lg hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all hover:border-amber-300/40 disabled:border-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Revision Modal */}
        <RevisionModal
          isOpen={revisionModalOpen}
          problem={selectedProblem}
          newRevisionNote={newRevisionNote}
          onNoteChange={setNewRevisionNote}
          onAddRevision={handleAddRevision}
          onClose={() => {
            setRevisionModalOpen(false);
            setSelectedProblem(null);
            setNewRevisionNote("");
          }}
          isLoading={addingRevision}
        />

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={deleteModalOpen}
          problem={problemToDelete}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setDeleteModalOpen(false);
            setProblemToDelete(null);
          }}
          isLoading={deleting}
        />
      </main>
    </div>
  );
};

export default ProblemsList;

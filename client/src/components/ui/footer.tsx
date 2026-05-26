import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950/70 text-slate-300 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="flex items-center">
          <Link to="/dsa" className="flex items-center -space-x-6 group">
            <img src="/logo.png" alt="TrackMe Logo" className=" h-20" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-amber-200 group-hover:text-amber-100 transition-colors">
                TrackMe
              </span>
              <span className="text-xs text-slate-400 -mt-1">DSA Tracker</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/dsa" className="transition-colors hover:text-amber-200">
            Dashboard
          </Link>
          <Link
            to="/dsa/problems"
            className="transition-colors hover:text-amber-200"
          >
            Problems
          </Link>
          <Link
            to="/profile"
            className="transition-colors hover:text-amber-200"
          >
            Profile
          </Link>
          <span className="text-slate-500">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

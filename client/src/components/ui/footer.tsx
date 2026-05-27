import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950/70 text-slate-300 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div className="flex items-center -space-x-4">
          <div className="flex h-20 items-center justify-center">
            <img src="/logo.png" alt="TrackMe logo" className="h-20" />
          </div>
          <div>
            <p className="text-2xl uppercase tracking-[0.3em] text-amber-300/80">
              TrackMe
            </p>
            <h1 className="text-sm text-white/50">
              Track the problems that matter.
            </h1>
          </div>
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
          <Link
            to="/terms"
            className="transition-colors hover:text-amber-200"
          >
            Terms
          </Link>
          <Link
            to="/privacy-policy"
            className="transition-colors hover:text-amber-200"
          >
            Privacy Policy
          </Link>
          <span className="text-slate-500">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

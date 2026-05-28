import React from "react";
import { config } from "../config/api";
import { Button } from "./ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card.tsx";
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${config.API_BASE_URL}${config.API_ENDPOINTS.AUTH.GOOGLE}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-xl space-y-8">
            <div className="flex items-center -space-x-4">
              <div className="flex h-20 items-center justify-center">
                <img
                  src="/logo.png"
                  alt="TrackMe logo"
                  className="h-20"
                />
              </div>
              <div>
                <p className="text-3xl uppercase tracking-[0.3em] text-amber-300/80">
                  TrackMe
                </p>
                <h1 className="text-sm font-semibold text-white">
                  Track the problems that matter.
                </h1>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["1000+", "Problems tracked"],
                ["500+", "Focused learners"],
                ["24x7", "Progress visibility"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
                >
                  <div className="text-2xl font-bold text-amber-300">{value}</div>
                  <div className="text-sm text-slate-300">{label}</div>
                </div>
              ))}
            </div>

            <Card className="overflow-hidden border-white/10 bg-slate-950/70 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <CardHeader className="space-y-4 border-b border-white/8 pb-6">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  Google sign-in required
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-semibold text-white sm:text-4xl">
                    Sign in to continue.
                  </CardTitle>
                  <CardDescription className="max-w-lg text-base text-slate-300">
                    Use your Google account to sync your DSA progress, keep your
                    streak alive, and pick up exactly where you left off.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <Button
                  onClick={handleGoogleLogin}
                  size="lg"
                  className="h-14 w-full rounded-2xl border border-amber-300/30 bg-amber-300 px-5 text-base font-semibold text-slate-950 shadow-[0_16px_40px_rgba(251,191,36,0.22)] transition-transform duration-200 hover:scale-[1.01] hover:bg-amber-200"
                >
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Revision-ready", "Revisit weak topics without losing context."],
                    ["One account", "Keep everything in sync across devices."],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm font-semibold text-white">{title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-300">{description}</div>
                    </div>
                  ))}
                </div>

                <p className="text-sm leading-6 text-slate-400">
                  By continuing, you agree to our {" "}
                  <Link to="/terms" className="underline underline-offset-4 hover:text-amber-300">
                    Terms of Service
                  </Link>
                  {" "} and {" "}
                  <Link to="/privacy" className="underline underline-offset-4 hover:text-amber-300">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="relative flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.22),_transparent_40%)]" />
          <div className="relative flex h-full w-full max-w-2xl items-center justify-center rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm lg:min-h-[calc(100vh-5rem)]">
            <div className="absolute left-6 top-6 rounded-full border border-amber-300/20 bg-slate-950/70 px-4 py-2 text-sm text-amber-100 shadow-lg backdrop-blur-md">
              Built for consistent practice
            </div>
            <div className="absolute bottom-6 left-6 right-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Focus", "Monitor what needs attention next."],
                ["Speed", "Jump back in without setup friction."],
                ["Momentum", "Keep the streak visible and alive."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left shadow-xl backdrop-blur-md">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-300">{description}</div>
                </div>
              ))}
            </div>
            <img
              src="/1.png"
              alt="TrackMe explorer illustration"
              className="max-h-[70vh] w-full object-contain drop-shadow-[0_28px_60px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

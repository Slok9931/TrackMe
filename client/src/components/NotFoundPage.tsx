import { useEffect } from 'react'
import { ArrowLeft, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found | TrackMe'
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 sm:px-10 lg:px-12">
        <section className="gap-8 flex flex-col-reverse items-center justify-center w-full">
          <div className="">

            <h1 className="text-center text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              This path does not exist.
            </h1>

            <p className="text-center mt-6 text-lg leading-8 text-slate-300 sm:text-xl">
              The page you are looking for may have moved, been renamed, or never existed.
              Use the button below to get back on track.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 font-semibold text-slate-950 transition-transform hover:-translate-y-0.5 hover:bg-amber-200"
              >
                <Home className="h-5 w-5" />
                Go home
              </Link>
              <Link
                to="/dsa"
                className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-5 py-3 font-semibold text-slate-100 transition-transform hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to dashboard
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-3xl">
              <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-amber-300/20 blur-3xl" />
              <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-emerald-400/15 blur-3xl" />
              <img
                src="/5.png"
                alt="Lost explorer illustration showing a 404 page not found scene"
                className="relative z-10 w-full rounded-[1.5rem] object-contain"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default NotFoundPage
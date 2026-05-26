import React from 'react'
import { Card } from './ui/card'

const Terms: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100">
          TrackMe Legal
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-slate-900/55 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              These terms explain how TrackMe can be used, what is expected from users, and
              where responsibilities and limitations apply.
            </p>
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none">
              <h2 className="text-lg font-semibold text-slate-50">Acceptance of Terms</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                By accessing or using TrackMe, you agree to follow these terms and any
                future updates posted by the project maintainers.
              </p>
            </Card>

            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none">
              <h2 className="text-lg font-semibold text-slate-50">User Responsibilities</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Keep account access secure, use the service responsibly, and avoid actions
                that interfere with the app, its data, or other users.
              </p>
            </Card>

            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none md:col-span-2">
              <h2 className="text-lg font-semibold text-slate-50">Limitation of Liability</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                TrackMe is provided on an as-is basis. To the maximum extent permitted by
                law, the maintainers are not liable for indirect, incidental, or
                consequential damages arising from your use of the service.
              </p>
            </Card>

            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none">
              <h2 className="text-lg font-semibold text-slate-50">Changes to Terms</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                These terms may be updated over time. Continued use of TrackMe after changes
                means you accept the revised version.
              </p>
            </Card>

            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none">
              <h2 className="text-lg font-semibold text-slate-50">Contact</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                If you have questions about these terms, contact the project maintainer
                through the usual support or repository channels.
              </p>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Terms

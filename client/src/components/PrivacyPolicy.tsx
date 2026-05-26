import React from 'react'
import { Card } from './ui/card'

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <main className="relative mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100">
          TrackMe Privacy
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-slate-900/55 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              This policy describes what information TrackMe collects, how it is used, and
              the safeguards around stored data and third-party integrations.
            </p>
          </div>

          <section className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none">
              <h2 className="text-lg font-semibold text-slate-50">Information We Collect</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                We may collect account details, problem progress, usage metrics, and any
                tokens required to connect with external services.
              </p>
            </Card>

            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none">
              <h2 className="text-lg font-semibold text-slate-50">How We Use Data</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Data is used to power your workspace, sync progress, generate summaries, and
                improve the product experience.
              </p>
            </Card>

            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none md:col-span-2">
              <h2 className="text-lg font-semibold text-slate-50">Storage and Retention</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                User content is retained only as long as needed to operate the service. Any
                deletion or export options should be documented alongside the final policy.
              </p>
            </Card>

            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none">
              <h2 className="text-lg font-semibold text-slate-50">Third-Party Services</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                TrackMe may rely on external providers for authentication, problem data, or
                AI-assisted features, and their own policies may also apply.
              </p>
            </Card>

            <Card className="border border-white/10 bg-slate-950/50 p-5 shadow-none">
              <h2 className="text-lg font-semibold text-slate-50">Contact</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Questions about privacy can be directed to the project maintainer through the
                repository or support channel.
              </p>
            </Card>
          </section>
        </div>
      </main>
    </div>
  )
}

export default PrivacyPolicy

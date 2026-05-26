import React from 'react'
import { Card } from './ui/card'

const Terms: React.FC = () => {
  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 bg-slate-900/60">
          <h1 className="text-2xl font-semibold mb-4">Terms of Service</h1>
          <p className="text-slate-300 mb-4">
            These are the terms of service for TrackMe. Replace this placeholder with
            the legal terms under which users may use the application.
          </p>

          <section className="space-y-3 text-slate-300">
            <h2 className="text-lg font-medium">Acceptance of Terms</h2>
            <p>
              By using TrackMe you agree to these terms. Provide the full terms here.
            </p>

            <h2 className="text-lg font-medium">User Responsibilities</h2>
            <p>
              Outline user responsibilities, prohibited activities, and community
              guidelines.
            </p>

            <h2 className="text-lg font-medium">Limitation of Liability</h2>
            <p>
              Describe limits on liability and disclaimers.
            </p>
          </section>
        </Card>
      </div>
    </main>
  )
}

export default Terms

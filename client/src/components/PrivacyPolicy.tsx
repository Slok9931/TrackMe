import React from 'react'
import { Card } from './ui/card'

const PrivacyPolicy: React.FC = () => {
  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 bg-slate-900/60">
          <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
          <p className="text-slate-300 mb-4">
            This is the privacy policy for TrackMe. Replace this placeholder with your
            actual privacy policy content. Keep this page public so users can review our
            data practices.
          </p>

          <section className="space-y-3 text-slate-300">
            <h2 className="text-lg font-medium">Information We Collect</h2>
            <p>
              We may collect account information, usage data, and tokens needed to integrate
              with third-party services. Details should go here.
            </p>

            <h2 className="text-lg font-medium">How We Use Data</h2>
            <p>
              Describe how user data is used, stored, and shared. Mention retention and
              deletion options.
            </p>

            <h2 className="text-lg font-medium">Contact</h2>
            <p>
              If you have questions about this privacy policy, please contact the project
              maintainer.
            </p>
          </section>
        </Card>
      </div>
    </main>
  )
}

export default PrivacyPolicy

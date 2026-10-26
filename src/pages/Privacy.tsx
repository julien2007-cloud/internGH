import { PublicFooter, PublicNav } from '../components/PublicNav'
import type { User } from '../lib/user'

const UPDATED = '26 October 2026'

/** Privacy policy (also the URL Meta requires before a WhatsApp app can go live). */
export function Privacy({ user }: { user: User | null }) {
  return (
    <>
      <PublicNav user={user} active="about" />
      <main className="page pub legal">
        <span className="kicker">Privacy policy</span>
        <h1>How InternGH uses your information</h1>
        <p className="legal-updated">Last updated {UPDATED}</p>

        <h2>What we collect</h2>
        <ul>
          <li><b>Account details</b> you give us when you sign in: your University of Ghana student email, name, student ID, major and level.</li>
          <li><b>Your phone number</b>, only if you turn on WhatsApp alerts.</li>
          <li><b>Your activity in the app</b>, such as saved listings and reminder settings. These are kept in your own browser.</li>
          <li><b>Listings</b> submitted by publishers, including the organisation's contact email (not shown to students).</li>
        </ul>

        <h2>How we use it</h2>
        <ul>
          <li>To show you opportunities that match your major and level.</li>
          <li>To send you WhatsApp messages you asked for: a welcome message, alerts when a matching opportunity is published, reminders before deadlines, and listings you send to yourself.</li>
          <li>To draft cover letters when you ask the assistant to.</li>
        </ul>
        <p>We don't sell your information or use it for advertising.</p>

        <h2>WhatsApp messages</h2>
        <p>
          WhatsApp messages are sent through the WhatsApp Business Platform operated by Meta. To deliver them, your phone number and the message
          content are processed by Meta under <a href="https://www.whatsapp.com/legal/business-terms" target="_blank" rel="noopener">WhatsApp's business terms</a>.
          Reply <b>STOP</b> in the InternGH chat at any time to stop alerts, and <b>START</b> to turn them back on.
        </p>

        <h2>Where it's stored</h2>
        <p>
          Your alert preferences (phone number, majors and level) and published listings are stored in a secured database hosted by our providers
          (Vercel and Upstash). Everything else stays in your browser. Access keys are kept on our servers and never sent to your device.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Alert preferences are kept while alerts are on. Listings are kept until shortly after their deadline. You can ask us to delete your
          information at any time.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>Turn WhatsApp alerts off by replying STOP, or don't add a phone number at all.</li>
          <li>Log out to clear your account from this browser.</li>
          <li>Ask for a copy of your information, or for it to be deleted, by messaging InternGH on WhatsApp.</li>
        </ul>

        <h2>Changes</h2>
        <p>If we change this policy, we'll update the date above.</p>
        <PublicFooter />
      </main>
    </>
  )
}

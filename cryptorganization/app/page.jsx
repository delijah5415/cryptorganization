import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Lock,
  Wallet,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          Cryptorganization
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-slate-300 hover:bg-slate-900"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            Secure Financial Organization
          </div>

          <h1 className="text-5xl font-bold leading-tight text-white md:text-7xl">
            Organize your digital financial world.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Cryptorganization gives you a secure environment
            to monitor balances, organize transactions, and
            manage financial activity.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
            >
              Create Account
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-900"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <Feature
            icon={<Lock size={24} />}
            title="Secure"
            description="Authentication and row-level database security protect user data."
          />

          <Feature
            icon={<Wallet size={24} />}
            title="Financial Control"
            description="Track inflows, outflows, and your current financial position."
          />

          <Feature
            icon={<BarChart3 size={24} />}
            title="Live Analytics"
            description="Monitor financial activity through a modern dashboard."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 text-blue-500">
        {icon}
      </div>

      <h2 className="text-xl font-semibold text-white">
        {title}
      </h2>

      <p className="mt-2 text-slate-400">
        {description}
      </p>
    </div>
  );
}
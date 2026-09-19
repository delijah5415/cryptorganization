"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  LogOut,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Dashboard({
  user,
  profile,
  initialTransactions,
}) {
  const router = useRouter();

  const [transactions, setTransactions] =
    useState(initialTransactions);

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [type, setType] =
    useState("inflow");

  const [loading, setLoading] =
    useState(false);

  const supabase = createClient();

  const totals = useMemo(() => {
    const inflow = transactions
      .filter((item) => item.type === "inflow")
      .reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

    const outflow = transactions
      .filter((item) => item.type === "outflow")
      .reduce(
        (sum, item) => sum + Number(item.amount),
        0
      );

    return {
      inflow,
      outflow,
      balance: inflow - outflow,
    };
  }, [transactions]);

  useEffect(() => {
    const channel = supabase
      .channel(`transactions-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setTransactions((current) => {
            if (payload.eventType === "INSERT") {
              return [payload.new, ...current];
            }

            if (payload.eventType === "UPDATE") {
              return current.map((item) =>
                item.id === payload.new.id
                  ? payload.new
                  : item
              );
            }

            if (payload.eventType === "DELETE") {
              return current.filter(
                (item) =>
                  item.id !== payload.old.id
              );
            }

            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user.id]);

  async function addTransaction(event) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !description.trim()
    ) {
      return;
    }

    setLoading(true);

    const { error } =
      await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type,
          amount: numericAmount,
          description: description.trim(),
        });

    if (!error) {
      setDescription("");
      setAmount("");
    }

    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  const money = new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: profile?.currency || "USD",
    }
  );

  return (
    <main className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xl font-bold">
              Cryptorganization
            </p>

            <p className="text-sm text-slate-400">
              {profile?.full_name ||
                user.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-900"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold">
          Financial dashboard
        </h1>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Card
            title="Balance"
            value={money.format(
              totals.balance
            )}
            icon={<Wallet />}
          />

          <Card
            title="Inflow"
            value={money.format(
              totals.inflow
            )}
            icon={<ArrowDownLeft />}
          />

          <Card
            title="Outflow"
            value={money.format(
              totals.outflow
            )}
            icon={<ArrowUpRight />}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={addTransaction}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-xl font-semibold">
              Add transaction
            </h2>

            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="mt-5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
            >
              <option value="inflow">
                Inflow
              </option>

              <option value="outflow">
                Outflow
              </option>
            </select>

            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <input
              required
              maxLength={255}
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3"
            />

            <button
              disabled={loading}
              className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Add transaction"}
            </button>
          </form>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Recent transactions
            </h2>

            <div className="mt-5 space-y-3">
              {transactions.length === 0 ? (
                <p className="py-10 text-center text-slate-500">
                  No transactions yet.
                </p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type ===
                      "inflow" ? (
                        <ArrowDownLeft className="text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="text-red-400" />
                      )}

                      <div>
                        <p className="font-medium">
                          {
                            transaction.description
                          }
                        </p>

                        <p className="text-xs text-slate-500">
                          {new Date(
                            transaction.created_at
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={
                        transaction.type ===
                        "inflow"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {transaction.type ===
                      "inflow"
                        ? "+"
                        : "-"}
                      {money.format(
                        Number(
                          transaction.amount
                        )
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <span className="text-slate-400">
          {title}
        </span>

        <span className="text-blue-500">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}
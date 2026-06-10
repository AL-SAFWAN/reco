"use client"

import { useState } from "react"
import {
  CheckIcon,
  CoinsIcon,
  InfoIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── Data ────────────────────────────────────────────────────────────

const DUMMY_TOKEN_BALANCE = 12
const DUMMY_TRANSACTIONS = [
  {
    id: 1,
    description: "Top-up · 40 tokens",
    date: "09 Jun 2026",
    amount: "+40",
    value: "£69.99",
  },
  {
    id: 2,
    description: "Lead purchase · Towing & Transport",
    date: "08 Jun 2026",
    amount: "-1",
    value: "£—",
  },
  {
    id: 3,
    description: "Lead purchase · Jump Start",
    date: "07 Jun 2026",
    amount: "-1",
    value: "£—",
  },
  {
    id: 4,
    description: "Top-up · 20 tokens",
    date: "05 Jun 2026",
    amount: "+20",
    value: "£36.00",
  },
]

const PACKS = [
  {
    id: "starter",
    tokens: 20,
    price: 36.0,
    perToken: 1.8,
    label: "Starter",
    description: "Perfect for getting started",
    highlight: false,
  },
  {
    id: "popular",
    tokens: 40,
    price: 69.99,
    perToken: 1.75,
    label: "Popular",
    description: "Best value for regular buyers",
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "pro",
    tokens: 80,
    price: 129.99,
    perToken: 1.62,
    label: "Pro",
    description: "Maximum savings for high-volume use",
    highlight: false,
    badge: "Best Value",
  },
]

// ── Components ──────────────────────────────────────────────────────

function PackCard({
  pack,
  selected,
  onSelect,
}: {
  pack: (typeof PACKS)[number]
  selected: boolean
  onSelect: () => void
}) {
  const vatAmount = (pack.price * 0.2).toFixed(2)
  const totalWithVat = (pack.price * 1.2).toFixed(2)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex w-full flex-col rounded-2xl border-2 p-6 text-left transition-all",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/40"
      )}
    >
      {/* Badge */}
      {pack.badge && (
        <span
          className={cn(
            "absolute -top-3 left-6 rounded-full px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase",
            selected
              ? "bg-background text-foreground"
              : "bg-foreground text-background"
          )}
        >
          {pack.badge}
        </span>
      )}

      {/* Token count */}
      <div className="flex items-end gap-2">
        <span className="text-4xl font-black tabular-nums">{pack.tokens}</span>
        <span
          className={cn(
            "mb-1 text-base font-semibold",
            selected ? "text-background/70" : "text-muted-foreground"
          )}
        >
          tokens
        </span>
      </div>

      <p
        className={cn(
          "mt-1 text-sm",
          selected ? "text-background/60" : "text-muted-foreground"
        )}
      >
        {pack.description}
      </p>

      {/* Price */}
      <div className="mt-5 border-t border-current/10 pt-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p
              className={cn(
                "text-[10px] font-semibold tracking-wider uppercase",
                selected ? "text-background/50" : "text-muted-foreground"
              )}
            >
              Ex. VAT
            </p>
            <p className="text-2xl font-black tabular-nums">
              £{pack.price.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "text-[10px] font-semibold tracking-wider uppercase",
                selected ? "text-background/50" : "text-muted-foreground"
              )}
            >
              Per token
            </p>
            <p className="text-base font-bold tabular-nums">
              £{pack.perToken.toFixed(2)}
            </p>
          </div>
        </div>

        <p
          className={cn(
            "mt-2 text-xs",
            selected ? "text-background/50" : "text-muted-foreground"
          )}
        >
          +£{vatAmount} VAT · £{totalWithVat} inc. VAT
        </p>
      </div>

      {/* Selected check */}
      {selected && (
        <span className="absolute top-4 right-4 flex size-6 items-center justify-center rounded-full bg-background">
          <CheckIcon className="size-3.5 text-foreground" />
        </span>
      )}
    </button>
  )
}

// ── Page ────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [selected, setSelected] = useState("popular")
  const pack = PACKS.find((p) => p.id === selected)!
  const totalWithVat = (pack.price * 1.2).toFixed(2)

  return (
    <div>
      {/* Hero */}
      <div className="bg-foreground px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="mb-1 text-sm font-medium text-background/50">Account</p>
          <h1 className="text-4xl font-black tracking-tight text-background sm:text-5xl">
            Billing
          </h1>
          <p className="mt-2 text-sm text-background/40">
            Manage your token balance and top-up your account.
          </p>

          {/* Balance tile */}
          <div className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-background/10 px-6 py-4">
            <CoinsIcon className="size-8 text-amber-400" />
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-background/50 uppercase">
                Current Balance
              </p>
              <p className="text-4xl font-black text-background tabular-nums">
                {DUMMY_TOKEN_BALANCE}
                <span className="ml-2 text-lg font-medium text-background/50">
                  tokens
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8 sm:px-6">
        {/* How tokens work */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">
                  1 token = 1 job lead purchase.
                </span>{" "}
                Tokens are deducted from your balance when you buy a lead. They
                never expire.
              </p>
              <p>
                All prices shown are exclusive of VAT. VAT at 20% is added at
                checkout.
              </p>
            </div>
          </div>
        </div>

        {/* Pack selector */}
        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Top Up Tokens
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {PACKS.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                selected={selected === pack.id}
                onSelect={() => setSelected(pack.id)}
              />
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-2xl border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              Order Summary
            </h2>
          </div>
          <div className="space-y-3 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {pack.tokens} tokens · {pack.label} pack
              </span>
              <span className="font-medium text-foreground">
                £{pack.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">VAT (20%)</span>
              <span className="font-medium text-foreground">
                £{(pack.price * 0.2).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-3 text-base font-bold">
              <span>Total</span>
              <span>£{totalWithVat}</span>
            </div>
          </div>
          <div className="border-t px-6 py-4">
            <Button className="w-full" size="lg">
              <ZapIcon className="mr-2 size-4" />
              Buy {pack.tokens} tokens · £{totalWithVat}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheckIcon className="size-3.5" />
              Payments are processed securely. Tokens are added instantly.
            </p>
          </div>
        </div>

        {/* Transaction history */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Transaction History
            </h2>
          </div>
          <div className="rounded-2xl border bg-card">
            <ul className="divide-y divide-border">
              {DUMMY_TRANSACTIONS.map((tx) => (
                <li key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      tx.amount.startsWith("+")
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <ReceiptIcon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {tx.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        tx.amount.startsWith("+")
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                      )}
                    >
                      {tx.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

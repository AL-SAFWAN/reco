"use client"

import { useState } from "react"
import {
  CheckIcon,
  Coins,
  CoinsIcon,
  InfoIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useTokenBalanceQuery,
  useTokenPackagesQuery,
  useTokenTransactionsQuery,
  usePurchaseTokenPackageMutation,
  type TokenPackage,
  type TokenTransaction,
} from "@/features/tokens/hooks/tokens"
import { MetricTile } from "@/components/ui/metric-tile"

function PackCard({
  pack,
  selected,
  onSelect,
  badge,
}: {
  pack: TokenPackage
  selected: boolean
  onSelect: () => void
  badge?: string
}) {
  const perToken = pack.price / pack.token_count
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
      {badge && (
        <span
          className={cn(
            "absolute -top-3 left-6 rounded-full border px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase",
            selected
              ? "bg-background text-foreground"
              : "bg-foreground text-background"
          )}
        >
          {badge}
        </span>
      )}
      <div className="flex items-end gap-2">
        <span className="text-4xl font-black tabular-nums">
          {pack.token_count}
        </span>
        <span
          className={cn(
            "mb-1 text-base font-semibold",
            selected ? "text-background/70" : "text-muted-foreground"
          )}
        >
          tokens
        </span>
      </div>
      {pack.description && (
        <p
          className={cn(
            "mt-1 text-sm",
            selected ? "text-background/60" : "text-muted-foreground"
          )}
        >
          {pack.description}
        </p>
      )}
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
              £{perToken.toFixed(2)}
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
      {selected && (
        <span className="absolute top-4 right-4 flex size-6 items-center justify-center rounded-full bg-background">
          <CheckIcon className="size-3.5 text-foreground" />
        </span>
      )}
    </button>
  )
}

function TxRow({ tx }: { tx: TokenTransaction }) {
  const isCredit = tx.direction === "credit"
  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isCredit
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            : "bg-muted text-muted-foreground"
        )}
      >
        <ReceiptIcon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {tx.description ?? (isCredit ? "Token top-up" : "Lead purchase")}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(tx.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 text-sm font-bold tabular-nums",
          isCredit
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-foreground"
        )}
      >
        {isCredit ? "+" : "-"}
        {tx.amount}
      </span>
    </li>
  )
}

const PACK_BADGES: Record<number, string> = {
  1: "Most Popular",
  2: "Best Value",
}

export default function BillingPage() {
  const { data: balanceData, isLoading: balanceLoading } =
    useTokenBalanceQuery()
  const { data: packages = [], isLoading: packagesLoading } =
    useTokenPackagesQuery()
  const { data: transactions = [], isLoading: txLoading } =
    useTokenTransactionsQuery()
  const purchaseMutation = usePurchaseTokenPackageMutation()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedPack =
    packages.find((p) => p.id === selectedId) ?? packages[1] ?? packages[0]
  const balance = balanceData?.token_balance ?? 0
  const totalWithVat = selectedPack
    ? (selectedPack.price * 1.2).toFixed(2)
    : "—"

  return (
    <>
      <div className="bg-foreground px-4 py-10 sm:px-6 sm:py-10.5">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-black tracking-tight text-background sm:text-5xl">
            Billing
          </h1>
          <p className="mt-2 mb-8 text-sm text-background/40">
            Manage your token balance and top-up your account.
          </p>

          <MetricTile
            label="Current Balance"
            value={
              <span className="inline-flex items-center gap-1 text-3xl font-black text-background tabular-nums">
                {balanceLoading ? (
                  <Skeleton className="mt-1 h-7 w-24 bg-background/20" />
                ) : (
                  <>
                    <Coins />
                    {balance}
                  </>
                )}
              </span>
            }
            sub="tokens available"
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-8 sm:px-6">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Tokens are deducted when you buy a lead. They never expire.</p>
              <p>
                All prices shown are exclusive of VAT. VAT at 20% is added at
                checkout.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Top Up Tokens
          </h2>
          {packagesLoading ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {packages.map((pack, i) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  selected={
                    (selectedId ?? packages[1]?.id ?? packages[0]?.id) ===
                    pack.id
                  }
                  onSelect={() => setSelectedId(pack.id)}
                  badge={PACK_BADGES[i]}
                />
              ))}
            </div>
          )}
        </div>

        {selectedPack && (
          <div className="rounded-2xl border bg-card">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Order Summary
              </h2>
            </div>
            <div className="space-y-3 px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedPack.token_count} tokens · {selectedPack.name} pack
                </span>
                <span className="font-medium text-foreground">
                  £{selectedPack.price.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">VAT (20%)</span>
                <span className="font-medium text-foreground">
                  £{(selectedPack.price * 0.2).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-base font-bold">
                <span>Total</span>
                <span>£{totalWithVat}</span>
              </div>
            </div>
            <div className="border-t px-6 py-4">
              <Button
                className="w-full"
                size="lg"
                disabled={purchaseMutation.isPending}
                onClick={() => purchaseMutation.mutate(selectedPack.id)}
              >
                <ZapIcon className="mr-2 size-4" />
                {purchaseMutation.isPending
                  ? "Processing…"
                  : `Buy ${selectedPack.token_count} tokens · £${totalWithVat}`}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheckIcon className="size-3.5" />
                Payments are processed securely. Tokens are added instantly.
              </p>
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Transaction History
          </h2>
          <div className="rounded-2xl border bg-card">
            {txLoading ? (
              <div className="space-y-px px-5 py-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="my-3 h-8 rounded-lg" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ReceiptIcon className="mx-auto mb-2 size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No transactions yet
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {transactions.map((tx) => (
                  <TxRow key={tx.id} tx={tx} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

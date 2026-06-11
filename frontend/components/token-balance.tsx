"use client"

import Link from "next/link"
import { CoinsIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTokenBalanceQuery } from "@/features/tokens/hooks/tokens"

export function TokenBalance({ compact }: { compact?: boolean }) {
  const { data } = useTokenBalanceQuery()
  const balance = data?.token_balance ?? 0

  return (
    <Link
      href="/billing"
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-semibold tabular-nums transition-colors hover:border-foreground/40 hover:bg-accent",
        compact && "px-2 py-1 text-xs"
      )}
    >
      <CoinsIcon className="size-3.5 text-amber-500" />
      <span className="text-foreground">{balance}</span>
      {!compact && <span className="text-muted-foreground">tokens</span>}
    </Link>
  )
}

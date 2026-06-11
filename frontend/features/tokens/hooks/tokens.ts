"use client"
import clientFetcher from "@/fetcher/client.fetcher"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

const TOKENS_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tokens`

// ── Types ──────────────────────────────────────────────────────────

export type TokenPackage = {
  id: string
  name: string
  token_count: number
  price: number
  description: string | null
  is_active: boolean
}

export type TokenTransaction = {
  id: string
  amount: number
  direction: "credit" | "debit"
  category: "purchase" | "lead_purchase"
  reference_id: string
  description: string | null
  created_at: string
}

// ── Fetchers ───────────────────────────────────────────────────────

const fetchTokenBalance = (): Promise<{ token_balance: number }> =>
  clientFetcher(`${TOKENS_URL}/balance`, { method: "GET" })

const fetchTokenTransactions = (): Promise<TokenTransaction[]> =>
  clientFetcher(`${TOKENS_URL}/transactions`, { method: "GET" })

const fetchTokenPackages = (): Promise<TokenPackage[]> =>
  clientFetcher(`${TOKENS_URL}/packages`, { method: "GET" })

const purchaseTokenPackage = (
  packageId: string
): Promise<{ token_balance: number; tokens_added: number }> =>
  clientFetcher(`${TOKENS_URL}/packages/${packageId}/purchase`, {
    method: "POST",
  })

// ── Hooks ──────────────────────────────────────────────────────────

export const useTokenBalanceQuery = () =>
  useQuery({
    queryKey: ["tokens", "balance"],
    queryFn: fetchTokenBalance,
  })

export const useTokenTransactionsQuery = () =>
  useQuery({
    queryKey: ["tokens", "transactions"],
    queryFn: fetchTokenTransactions,
  })

export const useTokenPackagesQuery = () =>
  useQuery({
    queryKey: ["tokens", "packages"],
    queryFn: fetchTokenPackages,
  })

export const usePurchaseTokenPackageMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: purchaseTokenPackage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tokens", "balance"] })
      queryClient.invalidateQueries({ queryKey: ["tokens", "transactions"] })
      toast.success(`${data.tokens_added} tokens added to your account`)
    },
    onError: () => {
      toast.error("Purchase failed. Please try again.")
    },
  })
}

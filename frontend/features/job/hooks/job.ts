"use client"
import clientFetcher from "@/fetcher/client.fetcher"
import {
  Job,
  JobCreate,
  JobUpdate,
  Lead,
} from "@/features/job/schema/jobSchema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/dist/client/components/navigation"

const JOBS_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/jobs`

// ── Fetchers ──────────────────────────────────────────────────────

const fetchJobs = (): Promise<Job[]> =>
  clientFetcher(JOBS_URL, { method: "GET" })

const fetchJob = (id: string): Promise<Job> =>
  clientFetcher(`${JOBS_URL}/${id}`, { method: "GET" })

const createJob = (body: JobCreate): Promise<Job> =>
  clientFetcher(JOBS_URL, { method: "POST", body })

const updateJob = ({
  id,
  body,
}: {
  id: string
  body: JobUpdate
}): Promise<Job> =>
  clientFetcher(`${JOBS_URL}/${id}`, { method: "PATCH", body })

const deleteJob = (id: string): Promise<void> =>
  clientFetcher(`${JOBS_URL}/${id}`, { method: "DELETE" })

// ── Hooks ─────────────────────────────────────────────────────────

export const useJobsQuery = () =>
  useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  })

export const useJobQuery = (id: string) =>
  useQuery({
    queryKey: ["jobs", id],
    queryFn: () => fetchJob(id),
    enabled: !!id,
  })

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
    },
  })
}

export const useUpdateJobMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateJob,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      queryClient.setQueryData(["jobs", data.id], data)
    },
  })
}

export const useDeleteJobMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      queryClient.removeQueries({ queryKey: ["jobs", id] })
      toast.success("Job deleted successfully")
    },
  })
}

const MARKETPLACE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/marketplace`

// marketplace
const fetchMarketplaceJobs = (): Promise<Job[]> =>
  clientFetcher(`${MARKETPLACE_URL}/`, { method: "GET" })

const fetchUserLeads = (): Promise<Lead[]> =>
  clientFetcher(`${MARKETPLACE_URL}/leads`, { method: "GET" })

const purchaseLead = (id: string): Promise<Job> =>
  clientFetcher(`${MARKETPLACE_URL}/leads/${id}/purchase`, { method: "POST" })

export const useMarketplaceJobsQuery = () => {
  return useQuery({
    queryKey: ["marketplace", "jobs"],
    queryFn: fetchMarketplaceJobs,
  })
}

export const useUserLeadsQuery = () => {
  return useQuery({
    queryKey: ["marketplace", "leads"],
    queryFn: fetchUserLeads,
  })
}

export const usePurchaseLeadMutation = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: purchaseLead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["marketplace", "jobs"] })
      queryClient.invalidateQueries({ queryKey: ["marketplace", "leads"] })
      queryClient.invalidateQueries({ queryKey: ["tokens", "balance"] })
      queryClient.invalidateQueries({ queryKey: ["tokens", "transactions"] })

      queryClient.invalidateQueries({ queryKey: ["jobs", data.id] })
      toast.success("Lead purchased successfully")
    },
    onError: (e) => {
      e.message === "Insufficient tokens"
        ? toast.error("You do not have enough tokens to purchase this lead.")
        : toast.error("Could not purchase lead. Please try again.")
      router.push("/billing")
    },
  })
}

type SavedJob = { job_id: string; saved_at: string }

const fetchSavedJobs = (): Promise<SavedJob[]> =>
  clientFetcher(`${MARKETPLACE_URL}/saved`, { method: "GET" })

const saveJob = (id: string): Promise<SavedJob> =>
  clientFetcher(`${MARKETPLACE_URL}/saved/${id}`, { method: "POST" })

const unsaveJob = (id: string): Promise<void> =>
  clientFetcher(`${MARKETPLACE_URL}/saved/${id}`, { method: "DELETE" })

export const useSavedJobsQuery = () =>
  useQuery({
    queryKey: ["marketplace", "saved"],
    queryFn: fetchSavedJobs,
  })

export const useSaveJobMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace", "saved"] })
      toast.success("Job saved")
    },
    onError: () => {
      toast.error("Could not save job")
    },
  })
}

export const useUnsaveJobMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unsaveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace", "saved"] })
      toast.success("Job removed from saved")
    },
    onError: () => {
      toast.error("Could not remove saved job")
    },
  })
}

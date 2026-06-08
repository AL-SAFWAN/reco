"use client"
import clientFetcher from "@/fetcher/client.fetcher"
import { Job, JobCreate, JobUpdate } from "@/features/job/schema/jobSchema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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

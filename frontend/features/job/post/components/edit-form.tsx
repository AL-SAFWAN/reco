"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link2, LoaderPinwheel } from "lucide-react"

import {
  jobCreateSchema,
  statusLabels,
  statusSchema,
  type Job,
  type JobCreate,
} from "../../schema/jobSchema"
import {
  useJobChangelogQuery,
  useSendEditLinkMutation,
  useUpdateJobMutation,
} from "../../hooks/job"
import { JobChangelog } from "../../components/job-changelog"
import { Button } from "@/components/ui/button"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Accordion,
} from "@/components/ui/accordion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import JobFormFields from "./share-form"

// ── Edit Form (no dialog wrapper — used by the routing-modal pattern) ────────

export function EditJobForm({
  job,
  onSuccess,
  onCancel,
}: {
  job: Job
  onSuccess: () => void
  onCancel: () => void
}) {
  const { mutate, isPending } = useUpdateJobMutation()
  const { mutate: sendEditLink, isPending: isSendingLink } =
    useSendEditLinkMutation()
  const { data: changelog = [], isLoading: changelogLoading } =
    useJobChangelogQuery(job.id)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const pendingCloseRef = { onChange: (_v: string) => {} }

  const isAlreadyClosed = job.lead_status === "closed"

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: job,
  })

  function onSubmit(data: JobCreate) {
    mutate({ id: job.id, body: data }, { onSuccess })
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={"relative flex min-h-0 flex-1 flex-col pt-4"}
      >
        <div className="border-b px-6 pb-3 sm:border-b-0 sm:pb-0">
          {/* Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="lead_status"
              control={control}
              render={({ field, fieldState }) => {
                pendingCloseRef.onChange = field.onChange
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lead_status">Status</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      disabled={isAlreadyClosed}
                      onValueChange={(v) => {
                        if (v === "closed" && !isAlreadyClosed) {
                          setCloseConfirmOpen(true)
                        } else {
                          field.onChange(v)
                        }
                      }}
                    >
                      <SelectTrigger
                        id="lead_status"
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusSchema.options.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            disabled={isAlreadyClosed && s !== "closed"}
                          >
                            {statusLabels[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isAlreadyClosed && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        This job is closed and cannot be re-opened.
                      </p>
                    )}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )
              }}
            />
          </div>
        </div>
        <JobFormFields register={register} control={control} errors={errors} />
        {/* Update log */}
        <Accordion type="single" collapsible className={"border-t"}>
          <AccordionItem value="item-1" className="px-6 py-2">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Update log
                </h3>
                <div className="h-px flex-1 bg-foreground/5" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="">
              <ScrollArea
                className={
                  changelog && changelog.length > 0 ? "h-64" : "h-auto"
                }
              >
                <JobChangelog logs={changelog} isLoading={changelogLoading} />
                <ScrollBar />
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <DialogFooter className={"mx-0 mb-0 px-6 py-4"}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          {job.customer_email && (
            <Button
              type="button"
              variant="secondary"
              disabled={isSendingLink || isPending}
              onClick={() => sendEditLink(job.id)}
            >
              {isSendingLink ? (
                <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="mr-2 h-4 w-4" />
              )}
              {isSendingLink ? "Sending…" : "Resend edit link"}
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && (
              <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>

      {/* Close-job confirmation */}
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close this job?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Closing a job is{" "}
                  <strong className="text-foreground">permanent</strong> — it
                  cannot be re-opened.
                </p>
                <p>
                  Once closed, any users who have already purchased this lead
                  will be able to see the full job details. No new purchases
                  will be accepted.
                </p>
                <p>Are you sure you want to close this job?</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCloseConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                pendingCloseRef.onChange("closed")
                setCloseConfirmOpen(false)
              }}
            >
              Yes, close job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Edit Dialog ───────────────────────────────────────────────────

export function EditJobDialog({
  job,
  open,
  onOpenChange,
}: {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { mutate, isPending } = useUpdateJobMutation()
  const { mutate: sendEditLink, isPending: isSendingLink } =
    useSendEditLinkMutation()
  const { data: changelog = [], isLoading: changelogLoading } =
    useJobChangelogQuery(open ? job.id : undefined)

  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const pendingCloseRef = { onChange: (_v: string) => {} }

  const isAlreadyClosed = job.lead_status === "closed"

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: job,
  })

  useEffect(() => {
    if (open) reset(job)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function onSubmit(data: JobCreate) {
    mutate({ id: job.id, body: data }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl"
          onMaximize={() => {
            onOpenChange(false)
            router.push(`/posting/edit/${job.id}`)
          }}
        >
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Edit job posting</DialogTitle>
            <DialogDescription>
              Updating
              <span className="font-mono text-xs text-muted-foreground italic">
                {" "}
                {job.id}{" "}
              </span>
              job
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="grid gap-5 overflow-y-auto px-6">
              {/* Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="lead_status"
                  control={control}
                  render={({ field, fieldState }) => {
                    pendingCloseRef.onChange = field.onChange
                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="lead_status">Status</FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          disabled={isAlreadyClosed}
                          onValueChange={(v) => {
                            if (v === "closed" && !isAlreadyClosed) {
                              setCloseConfirmOpen(true)
                            } else {
                              field.onChange(v)
                            }
                          }}
                        >
                          <SelectTrigger
                            id="lead_status"
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusSchema.options.map((s) => (
                              <SelectItem
                                key={s}
                                value={s}
                                disabled={isAlreadyClosed && s !== "closed"}
                              >
                                {statusLabels[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isAlreadyClosed && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            This job is closed and cannot be re-opened.
                          </p>
                        )}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )
                  }}
                />
              </div>
            </div>
            <JobFormFields
              register={register}
              control={control}
              errors={errors}
            />
            {/* Update log */}
            <Accordion type="single" collapsible className="border-t px-6 py-2">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      Update log
                    </h3>
                    <div className="h-px flex-1 bg-foreground/5" />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea
                    className={
                      changelog && changelog.length > 0 ? "h-64" : "h-auto"
                    }
                  >
                    <JobChangelog
                      logs={changelog}
                      isLoading={changelogLoading}
                    />
                    <ScrollBar />
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              {job.customer_email && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSendingLink || isPending}
                  onClick={() => sendEditLink(job.id)}
                >
                  {isSendingLink ? (
                    <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="mr-2 h-4 w-4" />
                  )}
                  {isSendingLink ? "Sending…" : "Resend edit link"}
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close-job confirmation */}
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close this job?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Closing a job is{" "}
                  <strong className="text-foreground">permanent</strong> it
                  cannot be re-opened.
                </p>
                <p>
                  Once closed, any users who have already purchased this lead
                  will be able to see the full job details. No new purchases
                  will be accepted.
                </p>
                <p>Are you sure you want to close this job?</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCloseConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                pendingCloseRef.onChange("closed")
                setCloseConfirmOpen(false)
              }}
            >
              Yes, close job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

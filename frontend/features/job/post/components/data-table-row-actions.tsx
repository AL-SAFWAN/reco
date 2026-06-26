"use client"

import { type Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDeleteJobMutation } from "../../hooks/job"
import { Job } from "../../schema/jobSchema"
import { useState } from "react"
import { EditJobDialog } from "./edit-form"

interface DataTableRowActionsProps<TData> {
  row: Row<Job>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter()
  const deleteJob = useDeleteJobMutation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="hidden sm:flex"
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="sm:hidden"
            onClick={() => router.push(`/posting/edit/${row.original.id}`)}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => deleteJob.mutate(row.original.id)}
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditJobDialog job={row.original} open={open} onOpenChange={setOpen} />
    </>
  )
}

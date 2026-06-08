"use client"

import { type Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { urgency, statuses } from "../../data/data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { CreateJobDialog } from "./job-posting-dialog"
interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Filter job postings..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("urgency") && (
          <DataTableFacetedFilter
            column={table.getColumn("urgency")}
            title="Urgency"
            options={urgency}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* <DataTableViewOptions table={table} /> */}
        <CreateJobDialog />
        {/* <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Add Job Posting</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create A Job Posting</DialogTitle>
            </DialogHeader>
            <RecoveryRequestForm />
          </DialogContent>
        </Dialog> */}
      </div>
    </div>
  )
}

"use client"

import { type Table } from "@tanstack/react-table"
import { Plus, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { urgency, statuses } from "../../data/data"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
      {/* <div className="flex items-center justify-between space-x-2 "> */}
      <div className="flex w-full flex-1 items-center gap-2">
        <Input
          placeholder="Filter job postings..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="w-full text-sm sm:max-w-xs"
        />
        {table.getColumn("lead_status") && (
          <DataTableFacetedFilter
            column={table.getColumn("lead_status")}
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
      <div className="flex w-full items-center gap-2 sm:w-fit">
        <Button asChild className="w-full gap-2 sm:w-fit">
          <Link href="/posting/create">
            <Plus className="size-4" />
            Add Job Posting
          </Link>
        </Button>
      </div>
    </div>
  )
}

"use client"

import { type ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Job } from "../../schema/jobSchema"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { statuses, urgency } from "../../data/data"

export const columns: ColumnDef<Job>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        className="hidden w-2 lg:block"
      />
    ),
    cell: ({ row }) => (
      <div className="hidden w-8 truncate lg:block">{row.getValue("id")}</div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: "service_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Service" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("service_type")}
          </span>
          <div className="text-xs text-muted-foreground">
            {row.original.urgency}
          </div>
        </div>
      )
    },
    enableGlobalFilter: true,
  },
  {
    accessorKey: "vehicle_make_model",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vehicle" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="">{row.getValue("vehicle_make_model")}</span>
          <div className="font-mono text-xs text-muted-foreground">
            {row.original.vehicle_reg}
          </div>
        </div>
      )
    },
    enableGlobalFilter: true,
  },
  {
    accessorKey: "pickup_location",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Pickup Location"
        className="hidden lg:block"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex">
          <MapPin className="size-3.5 shrink-0" />
          <span className="max-w-[180px] truncate">
            {row.getValue("pickup_location")}
          </span>
        </div>
      )
    },
    enableGlobalFilter: true,
  },
  {
    accessorKey: "lead_status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue("lead_status")
      )

      if (!status) {
        return null
      }
      return (
        <div
          className={cn(
            "svg:text-white flex w-[100px] items-center gap-2",
            status.label === "Open" && "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {status.icon && (
            <status.icon
              className={cn(
                "size-4 text-muted-foreground",
                status.label === "Open" &&
                  "text-emerald-600 dark:text-emerald-400"
              )}
            />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "urgency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Urgency" />
    ),
    cell: ({ row }) => {
      const priority = urgency.find(
        (priority) => priority.value === row.getValue("urgency")
      )

      if (!priority) {
        return null
      }

      return (
        <div className="flex items-center gap-2">
          {priority.icon && (
            <priority.icon className="size-4 text-muted-foreground" />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "lead_price",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Lead Price"
        className="hidden xl:block"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="hidden flex-col xl:flex">
          <span className=""> £{row.getValue("lead_price")}</span>
        </div>
      )
    },
    enableGlobalFilter: true,
  },
  {
    accessorKey: "estimated_payout",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Estimated Payout"
        className="hidden xl:block"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="hidden flex-col xl:flex">
          <span className=""> £{row.getValue("estimated_payout")}</span>
        </div>
      )
    },
    enableGlobalFilter: true,
  },

  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

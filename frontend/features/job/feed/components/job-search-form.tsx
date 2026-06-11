"use client"

import type React from "react"

import { Funnel, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AREAS } from "@/lib/job-data"

export interface Filters {
  query: string
  service_type: string
  vehicle_class: string
  urgency: string
  area: string
  open_only: boolean
  saved_only: boolean
  purchased_only: boolean
}

export const EMPTY_FILTERS: Filters = {
  query: "",
  service_type: "",
  vehicle_class: "",
  urgency: "",
  area: "",
  open_only: false,
  saved_only: false,
  purchased_only: false,
}

interface JobSearchFormProps {
  filters: Filters
  onChange: (filters: Filters) => void
  onReset: () => void
}

function FilterSelect({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string
  value: string
  options: string[]
  onValueChange: (value: string) => void
}) {
  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => onValueChange(v === "all" ? "" : v)}
    >
      <SelectTrigger className="w-full max-w-48">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Any {label.toLowerCase()}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function JobSearchForm({
  filters,
  onChange,
  onReset,
}: JobSearchFormProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by reference, location, or vehicle"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            className="pl-9"
            aria-label="Search recovery jobs"
          />
        </div>
        <FilterSelect
          label="Area"
          value={filters.area}
          options={AREAS}
          onValueChange={(v) => set({ area: v })}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="relative gap-2"
              aria-label="Filter options"
            >
              <Funnel className="size-4" />
              Filters
              {(filters.open_only || filters.saved_only || filters.purchased_only) && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                  {[filters.open_only, filters.saved_only, filters.purchased_only].filter(Boolean).length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Quick filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.open_only}
              onCheckedChange={(checked) => set({ open_only: checked })}
            >
              Open jobs only
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.saved_only}
              onCheckedChange={(checked) => set({ saved_only: checked })}
            >
              Saved jobs
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.purchased_only}
              onCheckedChange={(checked) => set({ purchased_only: checked })}
            >
              Purchased leads
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button type="submit" className="sm:w-32">
          Search jobs
        </Button>
      </div>
    </form>
  )
}

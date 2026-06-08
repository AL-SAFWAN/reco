"use client"

import type React from "react"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AREAS } from "@/lib/job-data"

export interface Filters {
  query: string
  service_type: string
  vehicle_class: string
  urgency: string
  area: string
  open_only: boolean
}

export const EMPTY_FILTERS: Filters = {
  query: "",
  service_type: "",
  vehicle_class: "",
  urgency: "",
  area: "",
  open_only: false,
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
      <SelectTrigger className="w-full max-w-48 bg-background">
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
        <Button type="submit" className="sm:w-32">
          Search jobs
        </Button>
      </div>
    </form>
  )
}

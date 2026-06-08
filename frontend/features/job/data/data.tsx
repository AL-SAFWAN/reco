import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BadgeDollarSignIcon,
  CheckCircle,
  Circle,
  CircleOff,
  CirclePoundSterling,
  Clock,
  HelpCircle,
  Timer,
  Zap,
} from "lucide-react"

export const labels = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Documentation",
  },
]

export const statuses = [
  {
    value: "open",
    label: "Open",
    icon: Circle,
  },

  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle,
  },
  {
    value: "purchased",
    label: "Purchased",
    icon: CirclePoundSterling,
  },
  { value: "en_route", label: "En Route", icon: Timer },
]

export const urgency = [
  {
    label: "Immediate",
    value: "Immediate",
    icon: Zap,
  },
  {
    label: "Scheduled",
    value: "Scheduled",
    icon: Clock,
  },
]

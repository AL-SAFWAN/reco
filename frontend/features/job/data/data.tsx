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
    value: "closed",
    label: "Closed",
    icon: CheckCircle,
  },
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

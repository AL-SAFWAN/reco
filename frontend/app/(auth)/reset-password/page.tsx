import { ResetForm } from "@/features/auth/components/forms/ResetForm"

export default function PasswordResetPage() {
  return (
    <div>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>
      <div className="mt-8 space-y-6">
        <ResetForm />
      </div>
    </div>
  )
}

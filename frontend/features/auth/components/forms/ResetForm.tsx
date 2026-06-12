"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { LoaderPinwheel } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ResetPasswordInputs,
  resetPasswordSchema,
} from "@/features/auth/schemas/authSchema"
import { useResetPasswordMutation } from "@/features/auth/hooks/auth"
import { ErrorAlert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import PasswordWithRequirements, {
  TogglePassword,
} from "@/components/ui/password"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useRouter } from "next/navigation"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ResetForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter()
  const [token, setToken] = React.useState<string | null>(null)
  const { mutate, isError, error, isPending } = useResetPasswordMutation()
  const isLoading = isPending

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
  })
  function onSubmit(data: ResetPasswordInputs) {
    if (token) {
      mutate({ ...data, token })
    }
  }

  React.useEffect(() => {
    const tokenFromUrl = new URLSearchParams(window.location.search).get(
      "token"
    )
    if (!tokenFromUrl) {
      router.push("/")
    } else {
      setToken(tokenFromUrl)
    }
  }, [token, router])

  return (
    <>
      <div className={cn("", className)} {...props}>
        <form
          className="grid gap-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <ErrorAlert isError={isError} error={error} />
          <FieldGroup>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <PasswordWithRequirements
                register={register}
                disabled={isPending}
              />
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm New Password
              </FieldLabel>
              <TogglePassword
                id="confirmPassword"
                disabled={isPending}
                register={register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <FieldError errors={[errors.confirmPassword]} />
              )}
            </Field>
          </FieldGroup>
          <Button
            className="w-full"
            disabled={isLoading}
            type="submit"
            aria-busy={isLoading}
          >
            {isLoading && (
              <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isLoading ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </div>
    </>
  )
}

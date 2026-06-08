"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderPinwheel } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ErrorAlert } from "@/components/ui/alert"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  LoginFormInputs,
  loginSchema,
} from "@/features/auth/schemas/authSchema"
import { useLoginMutation } from "@/features/auth/hooks/auth"
import { Button } from "@/components/ui/button"
import { TogglePassword } from "@/components/ui/password"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const { mutate, isError, error, isPending, isSuccess } = useLoginMutation()
  const isLoading = isPending || isSuccess

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginFormInputs) {
    mutate(data)
  }
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex flex-col space-y-1 text-center sm:space-y-2">
        <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">
          Login to your account
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Enter your credentials
        </p>
      </div>
      <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div aria-live="polite" className="">
          <ErrorAlert isError={isError} error={error} />
        </div>
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              autoFocus
              inputMode="email"
              disabled={isLoading}
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && <FieldError errors={[errors.email]} />}
          </Field>
          <Field data-invalid={!!errors.password}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
                href={"/password-recover"}
              >
                Forgot password?
              </Link>
            </div>
            <TogglePassword
              id="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              register={register("password")}
              errors={errors.password}
              aria-invalid={!!errors.password}
            />
            {errors.password && <FieldError errors={[errors.password]} />}
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
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300/70 to-transparent dark:via-neutral-700/70" />
      <p className="text-center text-xs text-muted-foreground sm:text-sm">
        Don't have an Account?{" "}
        <Link
          className="underline underline-offset-4 hover:text-primary"
          type="submit"
          href={"/signup"}
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

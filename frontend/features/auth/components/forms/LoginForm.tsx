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
    <div className={cn("space-y-6", className)} {...props}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Log in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials below
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
                className="text-xs font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground hover:no-underline"
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
              aria-invalid={!!errors.password}
            />
            {errors.password && <FieldError errors={[errors.password]} />}
          </Field>
        </FieldGroup>
        <Button
          className="w-full"
          size="lg"
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
      <div className="h-px w-full bg-border" />
      <p className="text-center text-sm text-muted-foreground">
        Don't have an Account?{" "}
        <Link
          className="font-semibold text-foreground underline underline-offset-4 hover:no-underline"
          type="submit"
          href={"/signup"}
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}

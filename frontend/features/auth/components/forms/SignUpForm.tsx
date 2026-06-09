"use client"

import * as React from "react"

import { LoaderPinwheel } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  SignUpFormInputs,
  signUpSchema,
} from "@/features/auth/schemas/authSchema"
import { useSignUpMutation } from "@/features/auth/hooks/auth"
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

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SignUpForm({ className, ...props }: UserAuthFormProps) {
  const { mutate, isError, error, isPending, isSuccess } = useSignUpMutation()
  const isLoading = isPending || isSuccess
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
  })
  function onSubmit(data: SignUpFormInputs) {
    delete data.confirm_password
    mutate(data)
  }
  return (
    <>
      <div className={cn("", className)} {...props}>
        <form
          className="grid gap-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div aria-live="polite">
            <ErrorAlert isError={isError} error={error} />
          </div>
          <FieldGroup>
            <Field data-invalid={!!errors.first_name}>
              <FieldLabel htmlFor="firstName">First name</FieldLabel>
              <Input
                id="firstName"
                placeholder="Tyler"
                type="text"
                autoComplete="given-name"
                {...register("first_name")}
                aria-invalid={!!errors.first_name}
              />
              {errors.first_name && <FieldError errors={[errors.first_name]} />}
            </Field>
            <Field data-invalid={!!errors.last_name}>
              <FieldLabel htmlFor="lastName">Last name</FieldLabel>
              <Input
                id="lastName"
                placeholder="Durden"
                type="text"
                autoComplete="family-name"
                {...register("last_name")}
                aria-invalid={!!errors.last_name}
              />
              {errors.last_name && <FieldError errors={[errors.last_name]} />}
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && <FieldError errors={[errors.email]} />}
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordWithRequirements
                register={register}
                errors={errors.password}
                disabled={isLoading}
              />
            </Field>
            <Field data-invalid={!!errors.confirm_password}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <TogglePassword
                id="confirmPassword"
                disabled={isLoading}
                register={register("confirm_password")}
                errors={errors.confirm_password}
                aria-invalid={!!errors.confirm_password}
              />
              {errors.confirm_password && (
                <FieldError errors={[errors.confirm_password]} />
              )}
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
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </>
  )
}

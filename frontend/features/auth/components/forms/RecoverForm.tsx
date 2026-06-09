"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderPinwheel } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  EmailFormInputs,
  emailSchema,
} from "@/features/auth/schemas/authSchema"
import { useRecoverPasswordMutation } from "@/features/auth/hooks/auth"
import { Button } from "@/components/ui/button"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RecoverForm({ className, ...props }: UserAuthFormProps) {
  const { mutate, isPending, isSuccess } = useRecoverPasswordMutation()
  const isLoading = isPending || isSuccess

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormInputs>({
    resolver: zodResolver(emailSchema),
  })

  function onSubmit(data: EmailFormInputs) {
    mutate(data)
  }
  return (
    <div className={cn("", className)} {...props}>
      <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
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
              inputMode="email"
              disabled={isLoading}
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && <FieldError errors={[errors.email]} />}
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
          {isLoading ? "Sending..." : "Send reset email"}
        </Button>
      </form>
    </div>
  )
}

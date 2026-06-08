import { SignUpForm } from "@/features/auth/components/forms/SignUpForm"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div>
      <div className="flex flex-col space-y-1 text-center sm:space-y-2">
        <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">
          Create an account
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Enter your details below to create your account
        </p>
      </div>
      <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-6">
        <SignUpForm />

        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300/70 to-transparent dark:via-neutral-700/70" />
        <div className="space-y-2">
          <p className="text-center text-xs text-muted-foreground sm:text-sm">
            Already have an Account?{" "}
            <Link
              className="underline underline-offset-4 hover:text-primary"
              type="submit"
              href={"/login"}
            >
              Login
            </Link>
          </p>

          <p className="px-4 text-center text-xs text-muted-foreground sm:px-8 sm:text-sm">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

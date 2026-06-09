import { SignUpForm } from "@/features/auth/components/forms/SignUpForm"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to get started
        </p>
      </div>
      <div className="mt-6 space-y-5 sm:mt-8">
        <SignUpForm />

        <div className="h-px w-full bg-border" />
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              className="font-semibold text-foreground underline underline-offset-4 hover:no-underline"
              href={"/login"}
            >
              Log in
            </Link>
          </p>

          <p className="px-4 text-center text-xs text-muted-foreground sm:px-0">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:no-underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:no-underline"
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

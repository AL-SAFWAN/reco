import { RecoverForm } from "@/features/auth/components/forms/RecoverForm"
import Link from "next/link"

export default function AuthenticationPage() {
  return (
    <div>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Recover your account
        </h1>
        <p className="text-sm text-muted-foreground">Enter your email below</p>
      </div>
      <div className="mt-6 space-y-5 sm:mt-8">
        <RecoverForm />
        <div className="h-px w-full bg-border" />
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            className="font-semibold text-foreground underline underline-offset-4 hover:no-underline"
            href={"/signup"}
          >
            Sign up
          </Link>{" "}
          or{" "}
          <Link
            className="font-semibold text-foreground underline underline-offset-4 hover:no-underline"
            href={"/login"}
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

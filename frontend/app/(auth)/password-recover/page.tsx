import { RecoverForm } from "@/features/auth/components/forms/RecoverForm"
import Link from "next/link"

export default function AuthenticationPage() {
  return (
    <div>
      <div className="flex flex-col space-y-1 text-center sm:space-y-2">
        <h1 className="text-xl font-semibold tracking-tight sm:text-3xl">
          Recover your account
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Enter your email below
        </p>
      </div>
      <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-6">
        <RecoverForm />
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300/70 to-transparent dark:via-neutral-700/70" />
        <div className="text-center text-xs text-muted-foreground sm:text-sm">
          Don&apos;t have an Account?{" "}
          <Link
            className="underline underline-offset-4 hover:text-primary"
            href={"/signup"}
          >
            Sign Up
          </Link>{" "}
          or{" "}
          <Link
            className="underline underline-offset-4 hover:cursor-pointer hover:text-primary"
            href={"/login"}
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

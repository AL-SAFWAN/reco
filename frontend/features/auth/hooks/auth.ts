"use client"
import clientFetcher from "@/fetcher/client.fetcher"
import {
  EmailFormInputs,
  LoginFormInputs,
  OTPFormInputs,
  ResetPasswordInputs,
  SignUpFormInputs,
} from "@/features/auth/schemas/authSchema"
import { User } from "@/schemas/enums"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const login = async ({ email: username, password }: LoginFormInputs) =>
  clientFetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/login`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "password",
      username,
      password,
    }),
  })

export const useLoginMutation = () => {
  const queryClient = useQueryClient() // Get the queryClient instance
  const router = useRouter()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token)
      queryClient.invalidateQueries({ queryKey: ["user"] })
      // Check for redirect parameter in URL
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get("redirect")
      router.push(redirect || "/")
    },
  })
}

const signup = async (data: SignUpFormInputs) =>
  clientFetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/register`, {
    method: "POST",
    body: data,
  })

export const useSignUpMutation = () => {
  const router = useRouter()
  const queryClient = useQueryClient() // Get the queryClient instance
  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.access_token)
      queryClient.invalidateQueries({ queryKey: ["user"] })
      router.push("/otp")
    },
  })
}

const resetPassword = (body: ResetPasswordInputs & { token: string }) =>
  clientFetcher(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reset-password/`,
    {
      method: "POST",
      body,
    }
  )

export const useResetPasswordMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      router.push("/login")
      toast.success("Password changed!", {
        className:
          "!border-2 border-green-500 bg-green-500/90 text-destructive-foreground [&>svg]:text-destructive ",
        description: "Try to login with your new password",
      })
    },
  })
}

const recoverPassword = (data: EmailFormInputs) =>
  clientFetcher(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/password-recovery/` +
      data.email,
    {
      method: "POST",
    }
  )

export const useRecoverPasswordMutation = () => {
  const router = useRouter()
  return useMutation({
    mutationFn: recoverPassword,
    onSettled: () => {
      router.push("/login")
      toast.success("Please check your email!", {
        className:
          "!border-2 border-green-500 bg-green-500/90 text-destructive-foreground [&>svg]:text-destructive ",
        description:
          "If an account exists, you will receive an email shortly with instructions",
      })
    },
  })
}

const fetchUser = async () =>
  clientFetcher<User>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/me`)

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false, // Don't retry on failure (e.g., if not authenticated)
    staleTime: 1000 * 60 * 60, // Data stays fresh for 1 hour
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient() // Get the queryClient instance
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem("access_token")
    queryClient.removeQueries({ queryKey: ["user"] })
    router.push("/login")
  }

  return logout
}

const requestOTP = (data: EmailFormInputs) =>
  clientFetcher(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/request-otp/` + data.email,
    {
      method: "POST",
    }
  )

export const useRequestOTPMutation = () => {
  return useMutation({
    mutationFn: requestOTP,
    onSuccess: () => {
      toast.success("Code Resent", {
        className:
          "!border-2 border-green-500 bg-green-500/90 text-destructive-foreground [&>svg]:text-destructive ",
        description: "A new verification code has been sent to your email.",
      })
    },
  })
}
const verifyOTP = (data: OTPFormInputs) =>
  clientFetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/verify-otp/`, {
    method: "POST",
    body: data,
  })

export const useVerifyOTPMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: verifyOTP,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data)
    },
    onError(error) {
      toast.error("Error", {
        className:
          "!border-2 border-destructive text-destructive-foreground  bg-destructive/90 text-destructive-foreground [&>svg]:text-destructive ",
        description: error.message,
      })
    },
  })
}

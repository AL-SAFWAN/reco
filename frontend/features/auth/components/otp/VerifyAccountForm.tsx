"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { OTPFormInputs, otpSchema } from "@/features/auth/schemas/authSchema";
import {
  useRequestOTPMutation,
  useUser,
  useVerifyOTPMutation,
} from "@/features/auth/hooks/auth";

export default function VerifyAccountForm() {
  const requestOTP = useRequestOTPMutation();
  const verifyOTP = useVerifyOTPMutation();
  const { data: user } = useUser();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormInputs>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = async (data: OTPFormInputs) => {
    if (user?.email) {
      verifyOTP.mutate({ email: user.email, otp: data.otp });
    }
  };

  const handleResend = () => {
    if (user?.email) {
      requestOTP.mutate({ email: user.email });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col justify-between gap-6"
    >
      <div className="flex w-fit flex-col items-start">
        <label htmlFor="otp" className="sr-only">
          One-time password
        </label>
        <div className="pb-2">
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <InputOTP maxLength={6} inputMode="numeric" {...field}>
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    className={
                      errors.otp && "!border-destructive !ring-destructive/30"
                    }
                  />
                  <InputOTPSlot
                    index={1}
                    className={
                      errors.otp && "!border-destructive !ring-destructive/30"
                    }
                  />
                  <InputOTPSlot
                    index={2}
                    className={
                      errors.otp && "!border-destructive !ring-destructive/30"
                    }
                  />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot
                    index={3}
                    className={
                      errors.otp && "!border-destructive !ring-destructive/30"
                    }
                  />
                  <InputOTPSlot
                    index={4}
                    className={
                      errors.otp && "!border-destructive !ring-destructive/30"
                    }
                  />
                  <InputOTPSlot
                    index={5}
                    className={
                      errors.otp && "!border-destructive !ring-destructive/30"
                    }
                  />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {errors.otp && (
            <p className="pt-2 text-xs font-medium text-destructive">
              {errors.otp.message}
            </p>
          )}
        </div>
        <p className="text-left text-sm font-medium text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 font-normal"
            onClick={handleResend}
            disabled={verifyOTP.isPending || requestOTP.isPending}
          >
            Resend
          </Button>
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={verifyOTP.isPending}>
        {verifyOTP.isPending ? "Verifying..." : "Verify account"}
      </Button>
    </form>
  );
}

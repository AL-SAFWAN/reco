"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import {
  FieldError,
  UseFormRegister,
  UseFormRegisterReturn,
} from "react-hook-form";

export default function PasswordWithRequirements({
  register,
  errors,
  disabled,
}: {
  register: UseFormRegister<any>;
  errors?: FieldError;
  disabled: boolean;
}) {
  const { onChange, onBlur, name, ref } = register("password", {
    required: true,
  });

  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    onChange(e);
  };
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(password);

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthTextColor = (score: number) => {
    if (score <= 2) return "text-red-500";
    if (score === 3) return "text-amber-500";
    return "text-emerald-500";
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return "Weak password";
    if (score === 3) return "Fair password";
    return "Strong password";
  };

  return (
    <>
      <div className="relative">
        <Input
          id="password"
          type={isVisible ? "text" : "password"}
          value={password}
          placeholder="Create a password"
          className="pr-10"
          onChange={onChangeHandler} // assign onChange event
          onBlur={onBlur} // assign onBlur event
          name={name} // assign name prop
          ref={ref} // assign ref prop
          aria-invalid={strengthScore < 4}
          aria-describedby="password-strength"
          error={errors}
          disabled={disabled}
        />
        <button
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls="password"
        >
          {isVisible ? (
            <Eye size={16} strokeWidth={2} aria-hidden="true" />
          ) : (
            <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Password strength indicator */}
      {password && (
        <>
          <div className="rounded-lg border border-border/70 bg-muted/40 p-4 pt-0">
            <div className="space-y-2 pt-2">
              {/* Password strength description */}
              <p
                id="password-strength"
                className="text-sm font-light text-foreground"
              >
                <span
                  className={`${getStrengthTextColor(strengthScore)} font-medium`}
                >
                  {getStrengthText(strengthScore)}.
                </span>{" "}
                Must contain:
              </p>

              {/* Password requirements list */}
              <ul className="space-y-1.5" aria-label="Password requirements">
                {strength.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {req.met ? (
                      <Check
                        size={16}
                        className="text-emerald-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <X
                        size={16}
                        className="text-muted-foreground/80"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
                    >
                      {req.text}
                      <span className="sr-only">
                        {req.met
                          ? " - Requirement met"
                          : " - Requirement not met"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
export function TogglePassword({
  register,
  errors,
  divClassName,
  className,
  ...props
}: {
  register: UseFormRegisterReturn;
  errors?: FieldError;
  divClassName?: string;
  className?: string;
  [key: string]: any;
}) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  return (
    <div className={"relative " + divClassName}>
      <Input
        id="input-confirm"
        placeholder="Enter your password"
        className={cn("pr-10", className)}
        type={isVisible ? "text" : "password"}
        {...register}
        aria-describedby="password-strength"
        error={errors}
        {...props}
      />
      <button
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground/80 transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={toggleVisibility}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        aria-controls="password"
      >
        {isVisible ? (
          <Eye size={16} strokeWidth={2} aria-hidden="true" />
        ) : (
          <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

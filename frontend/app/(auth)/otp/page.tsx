"use client"

import { useUser } from "@/features/auth/hooks/auth"
import VerifyAccountForm from "../../../features/auth/components/otp/VerifyAccountForm"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StepIndicator } from "@/features/auth/components/otp/StepIndicator"
import { PersonalInfoForm } from "@/features/auth/components/otp/PersonalInfoForm"
import { EmergencyContactForm } from "@/features/auth/components/otp/EmergencyContactForm"
import { MedicalInfoForm } from "@/features/auth/components/otp/MedicalInfoForm"
import { camelCaseToWord, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCompleteUserMutation } from "@/features/user/hooks/users"
import { Edit } from "lucide-react"

const steps = [
  "Verify Account",
  "Personal Information",
  "Emergency Contact",
  "Medical Information",
  "Summary",
]

const sections = [
  {
    title: "Personal Information",
    fields: [
      "weight",
      "height",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "country",
      "postalCode",
      "phone",
    ],
  },

  {
    title: "Emergency Contact",
    fields: [
      "emergencyContactName",
      "emergencyContactRelationship",
      "emergencyContactEmail",
      "emergencyContactPhone",
    ],
  },
  {
    title: "Medical Information",
    fields: ["allergies", "medications", "medicalConditions"],
  },
]

const stepDetails = [
  {
    title: "Verify your email",
    description: "Enter the 6-digit code we sent to your email address.",
  },
  {
    title: "Personal information",
    description: "Tell us how to reach you and keep your profile up to date.",
  },
  {
    title: "Emergency contact",
    description: "Add someone we can contact if an emergency happens.",
  },
  {
    title: "Medical information",
    description: "Share any details that help us keep you safe on the mat.",
  },
  {
    title: "Review & submit",
    description: "Confirm your details before finishing your setup.",
  },
]

export default function Page() {
  const { data: user } = useUser()
  const [step, setStep] = useState<number>(1)
  const router = useRouter()
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleNext = (data: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setStep((prev) => prev + 1)
  }

  const handlePrev = () => {
    setStep((prev) => prev - 1)
  }

  const updateUser = useCompleteUserMutation()

  useEffect(() => {
    if (!user) return

    const emailVerified = !!user.emailVerified
    const hasEmergencyContact =
      !!user.emergencyContactName &&
      !!user.emergencyContactRelationship &&
      !!user.emergencyContactPhone

    const isProfileCompleteForApp =
      emailVerified &&
      !!user.first_name &&
      !!user.last_name &&
      !!user.weight &&
      hasEmergencyContact

    if (isProfileCompleteForApp) {
      router.replace("/")
      return
    }

    if (!emailVerified) return
    if (step !== 1) return

    const desiredStep = !user.weight ? 2 : !hasEmergencyContact ? 3 : 4
    setStep(desiredStep)
  }, [
    router,
    step,
    user?.id,
    user?.emailVerified,
    user?.first_name,
    user?.last_name,
    user?.weight,
    user?.emergencyContactName,
    user?.emergencyContactRelationship,
    user?.emergencyContactPhone,
  ])

  const onSubmit = async () => {
    updateUser.mutate(formData)
  }

  if (!user) return null

  const hasEmergencyContact =
    !!user.emergencyContactName &&
    !!user.emergencyContactRelationship &&
    !!user.emergencyContactPhone

  if (
    user.emailVerified &&
    user.first_name &&
    user.last_name &&
    user.weight &&
    hasEmergencyContact
  ) {
    return <></>
  }

  const stepInfo = stepDetails[step - 1]

  return (
    <section className="relative h-[100dvh] min-h-[100svh] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_20%_-10%,hsl(var(--glow)/0.12),transparent_55%),radial-gradient(900px_circle_at_90%_10%,hsl(var(--glow)/0.06),transparent_60%)]" />
        <div className="absolute -top-24 h-60 w-60 rounded-full bg-[hsl(var(--glow)/0.06)] blur-3xl sm:right-[-6rem]" />
        <div className="absolute -bottom-28 h-72 w-72 rounded-full bg-[hsl(var(--glow)/0.05)] blur-3xl sm:left-[-6rem]" />
      </div>
      <div className="relative z-10 flex h-full w-full flex-col overflow-y-auto px-4 pt-20 pb-8 sm:px-8 sm:pt-28 sm:pb-8 lg:px-10 [@media(min-height:980px)]:justify-center">
        <div className="mx-auto w-full max-w-5xl">
          <div className="grid gap-5 border-border/70 bg-transparent p-0 sm:gap-6 sm:rounded-2xl sm:border sm:bg-white/5 sm:p-6 sm:shadow-[0_22px_60px_-40px_rgba(15,23,42,0.4)] sm:backdrop-blur lg:grid-cols-[240px_1fr] lg:gap-8 lg:p-8">
            <aside className="space-y-4 border-border/60 pb-4 sm:space-y-5 sm:pb-5 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.32em] text-muted-foreground uppercase">
                  Account setup
                </p>
                <h1 className="text-2xl font-semibold">
                  Complete your profile
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {/* Desktop: vertical step indicator */}
              <div className="hidden lg:block">
                <StepIndicator currentStep={step} steps={steps} />
              </div>
              {/* Mobile: horizontal step dots */}
              <div className="flex items-center gap-2 lg:hidden">
                {steps.map((s, i) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      i + 1 < step
                        ? "bg-primary"
                        : i + 1 === step
                          ? "bg-primary/60"
                          : "bg-border"
                    )}
                  />
                ))}
              </div>
            </aside>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
                  Step {step} of {steps.length}
                </p>
                <h2 className="text-xl font-semibold">{stepInfo?.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {stepInfo?.description}
                </p>
              </div>

              {step === 1 && <VerifyAccountForm />}
              {step === 2 && (
                <PersonalInfoForm
                  initialValues={formData}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}
              {step === 3 && (
                <EmergencyContactForm
                  initialValues={formData}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}
              {step === 4 && (
                <MedicalInfoForm
                  initialValues={formData}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}

              {step === 5 && (
                <div className="space-y-6">
                  {sections.map((section, i) => (
                    <Card
                      key={section.title}
                      className="border-border/70 bg-white/5 shadow-none"
                    >
                      <CardHeader className="py-3">
                        <CardTitle className="relative text-base font-semibold">
                          {section.title}
                          <Button
                            onClick={() => setStep(i + 2)}
                            variant="link"
                            className="absolute top-0 right-0 mr-0 p-0 text-sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {section.fields.map((field) => (
                            <div key={field} className="flex flex-col">
                              <dt className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                                {camelCaseToWord(field)}
                              </dt>
                              <dd className="mt-1 text-sm text-foreground">
                                {formData[field] || "N/A"}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="sticky bottom-0 flex items-center gap-3 bg-background/80 py-3 backdrop-blur-sm sm:static sm:bg-transparent sm:py-0 sm:backdrop-blur-none">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrev}
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      className="ml-auto"
                      onClick={onSubmit}
                      disabled={updateUser.isPending}
                    >
                      {updateUser.isPending
                        ? "Submitting account..."
                        : "Complete account"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import PixelBlast from "@/components/pixel"

export const metadata = {
  title: "Legion App",
  description: "Authentication pages for Legion App",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="">
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-6 p-8 md:p-12">
          <div className="flex justify-start">
            <div className="flex flex-col leading-none">
              <p className="text-xl font-black tracking-tight text-foreground">
                RECo
              </p>
              <p className="text-[9px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Recovery Platform
              </p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">{children}</div>
          </div>
        </div>
        <div className="relative m-8 ml-0 hidden overflow-hidden rounded-2xl bg-black lg:block dark:bg-white/85">
          <PixelBlast
            variant="square"
            pixelSize={4}
            patternScale={2}
            patternDensity={1}
            enableRipples
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            speed={0.5}
            transparent
            edgeFade={0.25}
          />
          <div className="absolute right-10 bottom-12 left-10">
            <p className="text-4xl leading-tight font-black tracking-tight text-white dark:text-black">
              Get back to
              <br />
              what matters.
            </p>
            <p className="mt-3 text-sm font-medium text-white/60 dark:text-black/60">
              Recovery opportunities. Simplified.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

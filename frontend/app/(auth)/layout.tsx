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
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <div className="hidden flex-col leading-none sm:flex">
              <p className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                RECo
              </p>
              <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Recovery Platform
              </p>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">{children}</div>
          </div>
        </div>
        <div className="relative m-10 ml-0 hidden rounded-4xl bg-slate-900/20 lg:block">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#979ecf"
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
        </div>
      </div>
    </div>
  )
}

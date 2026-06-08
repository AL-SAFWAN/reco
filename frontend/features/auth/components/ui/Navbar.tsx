import React from "react"
import Image from "next/image"
import Link from "next/link"
import { FileCheck } from "lucide-react"
import AuthButton from "./AuthButton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function Navbar() {
  return (
    <header className="top-0 z-50 flex w-full items-center justify-between px-4 py-4 backdrop-blur-sm sm:p-6 md:p-8">
      <aside className="group flex items-center gap-2 sm:gap-3"></aside>

      <aside className="z-0 flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="!h-5 !w-5 rounded-md !p-4"
          asChild
        ></Button>
        <Separator orientation="vertical" className="!h-5 !bg-black/40" />

        <AuthButton />
      </aside>
    </header>
  )
}

export default Navbar

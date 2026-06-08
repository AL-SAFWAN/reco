"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLogoutMutation, useUser } from "@/features/auth/hooks/auth";

function AuthButton() {
  const { data: user } = useUser();
  const logout = useLogoutMutation();

  const handleLogout = () => {
    logout.mutate();
  };

  return user && !(user.emailVerified && user.weight) ? (
    <Button size="sm" variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  ) : (
    <Button size="sm" asChild>
      <Link href="/signup">Sign Up</Link>
    </Button>
  );
}

export default AuthButton;

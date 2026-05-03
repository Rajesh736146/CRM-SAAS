"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
            {user?.name ? getInitials(user.name) : <User className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

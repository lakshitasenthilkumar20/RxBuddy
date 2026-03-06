import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getMe } from "../../api";

export function Navigation() {
  const navigate = useNavigate();
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getMe();
        if (user && user.full_name) {
          const names = user.full_name.split(' ');
          const userInitials = names.map((n: string) => n[0]).join('').toUpperCase();
          setInitials(userInitials);
        }
      } catch (err) {
        console.error("Failed to fetch user for navigation:", err);
      }
    }
    fetchUser();
  }, []);

  return (
    <nav className="h-[64px] border-b border-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      <span
        onClick={() => navigate("/dashboard")}
        className="font-semibold text-blue-600 text-2xl cursor-pointer"
      >
        RxBuddy
      </span>

      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {initials}
        </div>
      </div>
    </nav>
  );
}
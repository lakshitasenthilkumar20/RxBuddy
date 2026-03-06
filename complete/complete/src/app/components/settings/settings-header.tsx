import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export function SettingsHeader() {
  const navigate = useNavigate();

  return (
    <>
      <nav className="h-[64px] border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <span
          onClick={() => navigate("/dashboard")}
          className="font-semibold text-[#2563EB] text-2xl cursor-pointer"
        >
          RxBuddy
        </span>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </nav>

      <div className="mb-8 pt-20">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Account Settings</h1>
        <p className="text-[#64748B]">
          Manage your account preferences and security.
        </p>
      </div>
    </>
  );
}

import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";

import { changePassword } from "../../api";

export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsUpdating(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
      <h2 className="text-[#0F172A] mb-6">Change Password</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="currentPassword" className="text-[#0F172A] mb-2 block">
            Current Password
          </Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="border-[#E2E8F0] rounded-lg focus:border-[#2563EB] focus:ring-[#2563EB]"
          />
        </div>

        <div>
          <Label htmlFor="newPassword" className="text-[#0F172A] mb-2 block">
            New Password
          </Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border-[#E2E8F0] rounded-lg focus:border-[#2563EB] focus:ring-[#2563EB]"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-[#0F172A] mb-2 block">
            Confirm New Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border-[#E2E8F0] rounded-lg focus:border-[#2563EB] focus:ring-[#2563EB]"
          />
        </div>

        <p className="text-sm text-[#64748B] pt-1">
          Password must be at least 8 characters.
        </p>

        <div className="pt-2">
          <Button
            onClick={handleUpdatePassword}
            disabled={isUpdating}
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
          >
            {isUpdating ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}

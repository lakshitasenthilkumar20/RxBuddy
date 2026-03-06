import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { getMe } from "../../api";

export function PersonalInfoSection() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getMe();
        setFullName(user.full_name);
        setEmail(user.email);
        setTempName(user.full_name);
        setTempEmail(user.email);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    }
    fetchUser();
  }, []);


  const handleSave = () => {
    setFullName(tempName);
    setEmail(tempEmail);
    setIsEditing(false);
    toast.success("Personal information updated successfully");
  };

  const handleCancel = () => {
    setTempName(fullName);
    setTempEmail(email);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
      <h2 className="text-[#0F172A] mb-6">Personal Information</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-[#0F172A] mb-2 block">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            value={tempName}
            onChange={(e) => {
              setTempName(e.target.value);
              setIsEditing(true);
            }}
            className="border-[#E2E8F0] rounded-lg focus:border-[#2563EB] focus:ring-[#2563EB]"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-[#0F172A] mb-2 block">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={tempEmail}
            onChange={(e) => {
              setTempEmail(e.target.value);
              setIsEditing(true);
            }}
            className="border-[#E2E8F0] rounded-lg focus:border-[#2563EB] focus:ring-[#2563EB]"
          />
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
            >
              Save Changes
            </Button>
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="text-[#64748B] hover:text-[#0F172A]"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

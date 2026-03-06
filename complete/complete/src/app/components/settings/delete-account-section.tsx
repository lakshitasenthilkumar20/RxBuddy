import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";

import { useNavigate } from "react-router-dom";
import { deleteAccount, logout } from "../../api";

export function DeleteAccountSection() {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmationText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      logout();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-[#FEF2F2] rounded-lg border border-[#DC2626] p-6">
        <h2 className="text-[#0F172A] mb-2">Delete Account</h2>
        <p className="text-[#64748B] mb-6">
          This action permanently removes your account and medical records.
        </p>

        <Button
          onClick={() => setShowDeleteDialog(true)}
          variant="outline"
          className="border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white"
        >
          Delete Account
        </Button>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-[#DC2626]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0F172A]">
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#64748B]">
              This action cannot be undone. This will permanently delete your account, all medical records, prescriptions, and interaction history.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="deleteConfirm" className="text-[#0F172A] mb-2 block">
              Type <span className="font-mono bg-[#FEF2F2] px-1">DELETE</span> to confirm
            </Label>
            <Input
              id="deleteConfirm"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="border-[#E2E8F0] rounded-lg"
              placeholder="DELETE"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              className="text-[#64748B]"
              onClick={() => setConfirmationText("")}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-[#DC2626] hover:bg-[#b91c1c] text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

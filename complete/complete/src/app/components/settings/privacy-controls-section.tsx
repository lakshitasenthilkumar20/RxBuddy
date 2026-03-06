import { useState } from "react";
import { Button } from "../ui/button";
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

import { toast } from "sonner";

export function PrivacyControlsSection() {
  const [showClearHistory, setShowClearHistory] = useState(false);
  const [showClearPrescriptions, setShowClearPrescriptions] = useState(false);

  const handleClearHistory = () => {
    setShowClearHistory(false);
    toast.success("Interaction history cleared");
  };

  const handleClearPrescriptions = () => {
    setShowClearPrescriptions(false);
    toast.success("Uploaded prescriptions cleared");
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
        <h2 className="text-[#0F172A] mb-6">Privacy & Data Controls</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => setShowClearHistory(true)}
            variant="ghost"
            className="text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] flex-1"
          >
            Clear Interaction History
          </Button>

          <Button
            onClick={() => setShowClearPrescriptions(true)}
            variant="ghost"
            className="text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] flex-1"
          >
            Clear Uploaded Prescriptions
          </Button>
        </div>
      </div>

      {/* Clear History Confirmation Modal */}
      <AlertDialog open={showClearHistory} onOpenChange={setShowClearHistory}>
        <AlertDialogContent className="bg-white border-[#E2E8F0]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0F172A]">
              Clear Interaction History?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#64748B]">
              This action will permanently remove all your drug interaction history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[#64748B]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Prescriptions Confirmation Modal */}
      <AlertDialog open={showClearPrescriptions} onOpenChange={setShowClearPrescriptions}>
        <AlertDialogContent className="bg-white border-[#E2E8F0]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0F172A]">
              Clear Uploaded Prescriptions?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#64748B]">
              This action will permanently remove all your uploaded prescription images. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[#64748B]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearPrescriptions}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white"
            >
              Clear Prescriptions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

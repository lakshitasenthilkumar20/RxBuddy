import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function ReportsDataSection() {
  const handleDownload = (type: string) => {
    // Mock download functionality
    toast.success(`Downloading ${type}...`);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
      <h2 className="text-[#0F172A] mb-2">Reports & Data</h2>
      <p className="text-[#64748B] mb-6">
        Download your prescription and interaction history.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => handleDownload("Interaction Report (PDF)")}
          variant="outline"
          className="border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Interaction Report (PDF)
        </Button>

        <Button
          onClick={() => handleDownload("Prescription History (CSV)")}
          variant="outline"
          className="border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Prescription History (CSV)
        </Button>

        <Button
          onClick={() => handleDownload("Full Account Data (JSON)")}
          variant="outline"
          className="border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB] hover:text-white flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Full Account Data (JSON)
        </Button>
      </div>
    </div>
  );
}

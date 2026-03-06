import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Plus,
  Eye,
  Trash2,
  AlertTriangle,
  FileText
} from "lucide-react";

import { Navigation } from "../components/prescriptions/Navigation";
import { StatusDropdown } from "../components/prescriptions/StatusDropdown";
import { ViewPrescriptionModal } from "../components/prescriptions/ViewPrescriptionModal";
import { AddManualPrescriptionModal } from "../components/prescriptions/AddManualPrescriptionModal";
import { UploadPrescriptionModal } from "../components/prescriptions/UploadPrescriptionModal";
import { DeleteConfirmationModal } from "../components/prescriptions/DeleteConfirmationModal";
import { getMyPrescriptions, deletePrescription, updatePrescription, saveManualPrescription, checkInteractions, getAllergyRisks } from "../api";

type Status = "Active" | "Inactive" | "Completed" | "Paused";
type SafetyType = "Safe" | "Mild Interaction" | "Severe Interaction" | "Allergy Risk";

interface Medicine {
  id: string;
  name: string;
}

interface Prescription {
  id: string;
  name: string;
  rxId: string;
  dateUploaded: string;
  status: Status;
  safety: SafetyType[];
  ocrText: string;
  medicines: Medicine[];
}

export default function Prescriptions() {
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addManualModalOpen, setAddManualModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const [prescData, allergyRisks] = await Promise.all([
        getMyPrescriptions(),
        getAllergyRisks()
      ]);

      const mapped: Prescription[] = prescData.map((p: any, index: number) => {
        const dateSource = p.date || p.created_at || p.uploaded_at;
        let date: Date;

        if (p.date && typeof p.date === 'string' && p.date.includes('-')) {
          date = new Date(p.date.replace(/-/g, '/'));
        } else {
          date = new Date(dateSource || Date.now());
        }

        const hasAllergyRisk = allergyRisks.some((risk: any) => risk.prescription_id === p._id);

        return {
          id: p._id,
          name: p.file_path ? p.file_path.split('\\').pop()?.split('/').pop() || `Prescription ${index + 1}` : (p.name || `Prescription ${index + 1}`),
          rxId: p._id.slice(-6).toUpperCase(),
          dateUploaded: date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          status: (["ACTIVE", "UPLOADED", "OCR_PROCESSED"].includes(p.status) || !p.status)
            ? "Active"
            : (p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase()) as Status,
          safety: hasAllergyRisk ? ["Allergy Risk"] : ["Safe"],
          ocrText: p.ocr_text || "",
          medicines: (p.medicines || []).map((m: any, idx: number) => ({
            id: String(idx),
            name: typeof m === 'string' ? m : m.name
          }))
        };
      });

      setPrescriptions(mapped);

      // --- Trigger Interaction Safety Check ---
      const activePrescriptions = mapped.filter(p => p.status === "Active");
      const allActiveDrugs = [...new Set(activePrescriptions.flatMap(p => p.medicines.map(m => m.name.toLowerCase())))];

      if (allActiveDrugs.length >= 2) {
        try {
          const interactionResults = await checkInteractions(allActiveDrugs);
          if (interactionResults.length > 0) {
            const drugsWithInteractions = new Set();
            interactionResults.forEach((res: any) => {
              drugsWithInteractions.add(res.drug1.toLowerCase());
              drugsWithInteractions.add(res.drug2.toLowerCase());
            });

            setPrescriptions(prev => prev.map(p => {
              const hasInteractingDrug = p.medicines.some(m => drugsWithInteractions.has(m.name.toLowerCase()));

              if (p.status === "Active" && hasInteractingDrug) {
                const newSafety = [...p.safety.filter(s => s !== "Safe")];
                if (!newSafety.includes("Severe Interaction")) {
                  newSafety.push("Severe Interaction");
                }
                return { ...p, safety: newSafety.length > 0 ? newSafety : ["Safe"] };
              }
              return p;
            }));
          }
        } catch (apiErr) {
          console.error("Safety check failed:", apiErr);
        }
      }
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      await updatePrescription(id, { status: newStatus });
      fetchPrescriptions();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setViewModalOpen(true);
  };

  const handleDeleteClick = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPrescription) {
      try {
        await deletePrescription(selectedPrescription.id);
        fetchPrescriptions();
      } catch (err) {
        console.error("Failed to delete prescription:", err);
        alert("Failed to delete prescription. Please try again.");
      }
    }
    setDeleteModalOpen(false);
    setSelectedPrescription(null);
  };

  const handleSaveChanges = async (updates: { ocrText: string; medicines: Medicine[] }) => {
    if (!selectedPrescription) return;

    try {
      const medicinesForBackend = updates.medicines.map(m => ({
        name: m.name,
      }));

      await updatePrescription(selectedPrescription.id, {
        ocr_text: updates.ocrText,
        medicines: medicinesForBackend
      });

      fetchPrescriptions();
      setViewModalOpen(false);
    } catch (err) {
      console.error("Failed to save changes:", err);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleManualSave = async (data: any) => {
    try {
      await saveManualPrescription(data);
      setAddManualModalOpen(false);
      fetchPrescriptions();
    } catch (err) {
      console.error("Failed to save manual prescription:", err);
      alert("Failed to save. Please try again.");
    }
  };

  const interactionIconColor: Record<string, string> = {
    Safe: "text-gray-400",
    "Mild Interaction": "text-yellow-600",
    "Severe Interaction": "text-red-600",
    "Allergy Risk": "text-orange-600",
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Manage Your Prescriptions
            </h1>
            <p className="text-base text-gray-600">
              Manage and review your uploaded prescriptions with automated safety checks.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload New
            </button>

            <button
              onClick={() => setAddManualModalOpen(true)}
              className="flex items-center gap-2 px-4 h-11 bg-white text-blue-600 font-bold border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Manually
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Prescription</th>
                <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Date Uploaded</th>
                <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Safety Status</th>
                <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {prescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-900">
                      {prescription.name}
                    </div>
                    <div className="text-xs font-mono text-gray-400 mt-1">
                      ID: {prescription.rxId}
                    </div>
                  </td>

                  <td className="px-8 py-6 text-sm font-medium text-gray-600">
                    {prescription.dateUploaded}
                  </td>

                  <td className="px-8 py-6">
                    <StatusDropdown
                      currentStatus={prescription.status}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(
                          prescription.id,
                          newStatus
                        )
                      }
                    />
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      {prescription.safety.map((status, idx) => (
                        <div key={idx} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border w-fit ${status === 'Safe' ? 'bg-green-50 text-green-700 border-green-100' :
                            status === 'Allergy Risk' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                              'bg-red-50 text-red-700 border-red-100'
                          }`}>
                          <div className={`w-1 h-1 rounded-full ${status === 'Safe' ? 'bg-green-500' :
                              status === 'Allergy Risk' ? 'bg-orange-500' :
                                'bg-red-500'
                            }`} />
                          {status}
                        </div>
                      ))}
                    </div>
                  </td>


                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleViewPrescription(prescription)
                        }
                        className="p-2.5 bg-gray-50 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl transition-all"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            "/dashboard/interactions",
                            { state: { prescription } }
                          )
                        }
                        className={`p-2.5 rounded-xl transition-all ${prescription.safety.includes('Safe') && prescription.safety.length === 1 ? 'bg-gray-50 hover:bg-gray-200' : 'bg-rose-50 hover:bg-rose-600 group'
                          }`}
                        title="View Safety Report"
                      >
                        <AlertTriangle
                          className={`w-5 h-5 ${prescription.safety.includes('Safe') && prescription.safety.length === 1 ? 'text-gray-300' : 'text-rose-600 group-hover:text-white'
                            }`}
                        />
                      </button>


                      <button
                        onClick={() =>
                          handleDeleteClick(prescription)
                        }
                        className="p-2.5 bg-gray-50 hover:bg-rose-600 text-gray-400 hover:text-white rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {prescriptions.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No prescriptions found</h3>
              <p className="text-gray-400">Start by uploading your first medical record.</p>
            </div>
          )}
        </div>
      </div>

      {selectedPrescription && (
        <ViewPrescriptionModal
          prescription={selectedPrescription}
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedPrescription(null);
          }}
          onSaveChanges={handleSaveChanges}
        />
      )}

      <AddManualPrescriptionModal
        isOpen={addManualModalOpen}
        onClose={() => setAddManualModalOpen(false)}
        onSave={handleManualSave}
      />

      <UploadPrescriptionModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={() => { fetchPrescriptions(); }}
      />


      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        prescriptionName={selectedPrescription?.name || ""}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedPrescription(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
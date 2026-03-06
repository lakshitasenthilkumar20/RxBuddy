import React, { useState } from 'react';
import { X, Plus, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Medicine {
  id: string;
  name: string;
}

type SafetyType = "Safe" | "Mild Interaction" | "Severe Interaction" | "Allergy Risk";

interface ViewPrescriptionModalProps {
  prescription: {
    id: string;
    name: string;
    rxId: string;
    dateUploaded: string;
    ocrText: string;
    medicines: Medicine[];
    safety: SafetyType[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSaveChanges: (updates: { ocrText: string; medicines: Medicine[] }) => void;
}

export function ViewPrescriptionModal({ prescription, isOpen, onClose, onSaveChanges }: ViewPrescriptionModalProps) {
  const navigate = useNavigate();
  const [isEditingOCR, setIsEditingOCR] = React.useState(false);
  const [ocrText, setOcrText] = React.useState(prescription.ocrText);
  const [medicines, setMedicines] = React.useState<Medicine[]>(prescription.medicines);
  const [isAddingMedicine, setIsAddingMedicine] = React.useState(false);
  const [newMedicineName, setNewMedicineName] = React.useState('');

  // Sync state with props when prescription changes
  React.useEffect(() => {
    setOcrText(prescription.ocrText);
    setMedicines(prescription.medicines);
  }, [prescription]);

  if (!isOpen) return null;

  const handleViewInteractions = () => {
    onClose();
    navigate('/dashboard/interactions', { state: { prescription } });
  };

  const handleSaveOCR = () => {
    onSaveChanges({ ocrText, medicines });
    setIsEditingOCR(false);
  };

  const handleCancelOCR = () => {
    setOcrText(prescription.ocrText);
    setIsEditingOCR(false);
  };

  const handleRemoveMedicine = (id: string) => {
    const updated = medicines.filter(m => m.id !== id);
    setMedicines(updated);
    onSaveChanges({ ocrText, medicines: updated });
  };

  const handleAddMedicine = () => {
    if (newMedicineName.trim()) {
      const newMedicine: Medicine = {
        id: Date.now().toString(),
        name: newMedicineName.trim(),
      };
      const updated = [...medicines, newMedicine];
      setMedicines(updated);
      onSaveChanges({ ocrText, medicines: updated });
      setNewMedicineName('');
      setIsAddingMedicine(false);
    }
  };

  const getSafetyBadge = () => {
    const statuses = prescription.safety;
    return (
      <div className="flex flex-wrap gap-2">
        {statuses.map((status, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border ${status === 'Safe' ? 'bg-green-50 text-green-700 border-green-100' :
              status === 'Allergy Risk' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                'bg-red-50 text-red-700 border-red-100'
              }`}
          >
            {status === 'Safe' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
              status === 'Allergy Risk' ? <ShieldAlert className="w-3.5 h-3.5" /> :
                <AlertCircle className="w-3.5 h-3.5" />}
            {status}
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col transition-all animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Prescription Details</h2>
              {getSafetyBadge()}
            </div>
            <p className="text-sm text-gray-400 mt-1">Uploaded: {prescription.dateUploaded} • ID: {prescription.rxId || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-hide">
          {/* Section 1: Raw OCR Text */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Raw Prescription Text</h3>
              {!isEditingOCR ? (
                <button
                  onClick={() => setIsEditingOCR(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Edit Raw Data
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveOCR}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Confirm Save
                  </button>
                  <button
                    onClick={handleCancelOCR}
                    className="text-xs font-bold text-gray-400 hover:text-gray-500"
                  >
                    Discard Changes
                  </button>
                </div>
              )}
            </div>

            <div className={`p-5 rounded-2xl font-mono text-sm leading-relaxed transition-all ${isEditingOCR
              ? 'bg-white border-2 border-blue-600 ring-4 ring-blue-50'
              : 'bg-gray-50 border border-gray-100 text-gray-600'
              }`}>
              <textarea
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                disabled={!isEditingOCR}
                className="w-full h-40 bg-transparent border-none outline-none resize-none scrollbar-hide"
                placeholder="No text extracted"
              />
            </div>
          </div>

          {/* Section 2: Extracted Medicine Tokens */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Recognized Medications</h3>

            <div className="flex flex-wrap gap-2.5">
              {medicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-50/50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100/50 group"
                >
                  {medicine.name}
                  <button
                    onClick={() => handleRemoveMedicine(medicine.id)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-700 rounded-md p-0.5 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {!isAddingMedicine ? (
                <button
                  onClick={() => setIsAddingMedicine(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 text-gray-400 hover:border-blue-600 hover:text-blue-600 rounded-xl text-sm font-bold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Medicine
                </button>
              ) : (
                <div className="flex gap-2 w-full max-w-sm">
                  <input
                    type="text"
                    value={newMedicineName}
                    onChange={(e) => setNewMedicineName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMedicine()}
                    placeholder="Enter med name..."
                    className="flex-1 px-4 py-2 border-2 border-blue-600 rounded-xl text-sm font-bold outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleAddMedicine}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Medication Safety Analysis</h3>

            <div className="space-y-3">
              {prescription.safety.map((status, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border-2 flex gap-5 items-start transition-all ${status === 'Safe' ? 'bg-emerald-50 border-emerald-100' :
                  status === 'Allergy Risk' ? 'bg-orange-50 border-orange-100' :
                    'bg-rose-50 border-rose-100'
                  }`}>
                  <div className={`p-3 rounded-xl flex-shrink-0 ${status === 'Safe' ? 'bg-emerald-100 text-emerald-600' :
                    status === 'Allergy Risk' ? 'bg-orange-100 text-orange-600' :
                      'bg-rose-100 text-rose-600'
                    }`}>
                    {status === 'Safe' ? <CheckCircle2 className="w-8 h-8" /> :
                      status === 'Allergy Risk' ? <ShieldAlert className="w-8 h-8" /> :
                        <AlertCircle className="w-8 h-8" />}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-1">
                      {status === 'Safe' ? 'Patient Safety: Verified Clear' :
                        status === 'Allergy Risk' ? 'Sensitive: Potential Allergy Detected' :
                          `Warning: ${status}`}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {status === 'Safe'
                        ? 'Our system performed an interaction and allergy check. No immediate risks were identified between the listed medicines and your profile.'
                        : status === 'Allergy Risk'
                          ? 'One or more medications in this prescription match your recorded allergies or contain allergic ingredients.'
                          : 'A potential drug-drug interaction was identified. Please review the detailed safety report.'}
                    </p>

                    {status !== 'Safe' && (
                      <button
                        onClick={() => {
                          onClose();
                          if (status === 'Allergy Risk') {
                            navigate('/dashboard/allergies');
                          } else {
                            navigate('/dashboard/interactions', { state: { prescription } });
                          }
                        }}
                        className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-gray-900 font-bold text-sm rounded-xl border border-gray-200 hover:border-gray-900 shadow-sm transition-all"
                      >
                        View Detailed Report
                        <span className="text-gray-400 tracking-tighter">→</span>
                      </button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface MedicineEntry {
  id: string;
  name: string;
  dosage: string;
}

interface AddManualPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prescription: {
    name: string;
    date: string;
    doctor: string;
    medicines: MedicineEntry[];
    notes: string;
  }) => void;
}

export function AddManualPrescriptionModal({ isOpen, onClose, onSave }: AddManualPrescriptionModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctor, setDoctor] = useState('');
  const [medicines, setMedicines] = useState<MedicineEntry[]>([
    { id: '1', name: '', dosage: '' }
  ]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleAddMedicine = () => {
    setMedicines([...medicines, { id: Date.now().toString(), name: '', dosage: '' }]);
  };

  const handleRemoveMedicine = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter(m => m.id !== id));
    }
  };

  const handleMedicineChange = (id: string, field: 'name' | 'dosage', value: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSave = () => {
    if (!name.trim() || !date) return;

    onSave({
      name: name.trim(),
      date,
      doctor: doctor.trim(),
      medicines: medicines.filter(m => m.name.trim() && m.dosage.trim()),
      notes: notes.trim(),
    });

    // Reset form
    setName('');
    setDate(new Date().toISOString().split('T')[0]);
    setDoctor('');
    setMedicines([{ id: '1', name: '', dosage: '' }]);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">Add Prescription Manually</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Prescription Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prescription Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Prescription 01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Doctor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="e.g., Dr. Smith"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Medicines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Medicines
            </label>
            <div className="space-y-3">
              {medicines.map((medicine, index) => (
                <div key={medicine.id} className="flex gap-2">
                  <input
                    type="text"
                    value={medicine.name}
                    onChange={(e) => handleMedicineChange(medicine.id, 'name', e.target.value)}
                    placeholder="Medicine name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={medicine.dosage}
                    onChange={(e) => handleMedicineChange(medicine.id, 'dosage', e.target.value)}
                    placeholder="Dosage (e.g., 10mg)"
                    className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {medicines.length > 1 && (
                    <button
                      onClick={() => handleRemoveMedicine(medicine.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleAddMedicine}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mt-3"
            >
              <Plus className="w-4 h-4" />
              Add Another Medicine
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes / Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or notes..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !date}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Save Prescription
          </button>
        </div>
      </div>
    </div>
  );
}

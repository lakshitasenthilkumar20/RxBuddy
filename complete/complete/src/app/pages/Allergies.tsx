import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    AlertCircle,
    ChevronLeft,
    LayoutDashboard,
    ShieldAlert,
    Save,
    Loader2,
    AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMe, updateAllergies } from "../api";
import { toast, Toaster } from "sonner";

interface AllergyItem {
    id: string;
    name: string;
    severity: "Low" | "Medium" | "High";
    reactionType: string;
    notes?: string;
    dateAdded: string;
}

export default function Allergies() {
    const navigate = useNavigate();
    const [allergies, setAllergies] = useState<AllergyItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<AllergyItem>>({
        name: "",
        severity: "Medium",
        reactionType: "",
        notes: ""
    });

    useEffect(() => {
        async function fetchUser() {
            try {
                const user = await getMe();
                if (user.allergies) {
                    setAllergies(user.allergies);
                }
            } catch (err) {
                console.error("Failed to fetch allergies:", err);
                toast.error("Failed to load your allergy profile");
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, []);

    const handleAddAllergy = () => {
        if (!formData.name) {
            toast.error("Please enter an allergy name");
            return;
        }

        const newAllergy: AllergyItem = {
            id: Date.now().toString(),
            name: formData.name!,
            severity: (formData.severity as any) || "Medium",
            reactionType: formData.reactionType || "Unknown",
            notes: formData.notes || "",
            dateAdded: new Date().toISOString()
        };

        const updatedAllergies = [...allergies, newAllergy];
        setAllergies(updatedAllergies);
        setFormData({ name: "", severity: "Medium", reactionType: "", notes: "" });
        setIsAdding(false);
        toast.success(`${newAllergy.name} added to your record`);
    };

    const handleRemoveAllergy = (id: string) => {
        const allergyToRemove = allergies.find(a => a.id === id);
        setAllergies(allergies.filter(a => a.id !== id));
        toast.info(`${allergyToRemove?.name} removed`);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            await updateAllergies(allergies);
            toast.success("Allergy profile saved successfully");
        } catch (err) {
            console.error("Save failed:", err);
            toast.error("Failed to save allergy profile to server");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Toaster position="top-right" />

            {/* Navigation */}
            <nav className="h-[64px] bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-8">
                    <span className="font-semibold text-blue-600 text-2xl">RxBuddy</span>
                    <h1 className="text-xl font-semibold text-gray-900">Manage Allergies</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Allergy Profile</h2>
                        <p className="text-gray-600">
                            Maintain an accurate list of your medication allergies for your records.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Allergy
                        </button>
                    </div>
                </div>

                {/* Add Form */}
                {isAdding && (
                    <div className="bg-white border-2 border-blue-500 rounded-xl p-6 mb-8 shadow-md">
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Add New Allergy
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Medication or Substance</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Penicillin"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                <select
                                    value={formData.severity}
                                    onChange={e => setFormData({ ...formData, severity: e.target.value as any })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reaction Description</label>
                                <input
                                    type="text"
                                    value={formData.reactionType}
                                    onChange={e => setFormData({ ...formData, reactionType: e.target.value })}
                                    placeholder="e.g. Skin rashes, swelling, difficulty breathing"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Additional details about the allergy..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddAllergy}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Add to List
                            </button>
                        </div>
                    </div>
                )}

                {/* Allergy List */}
                <div className="space-y-4">
                    {allergies.length > 0 ? (
                        allergies.map(allergy => (
                            <div
                                key={allergy.id}
                                className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 ${allergy.severity === 'High' ? 'border-l-4 border-l-red-500' :
                                        allergy.severity === 'Medium' ? 'border-l-4 border-l-amber-500' :
                                            'border-l-4 border-l-blue-500'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${allergy.severity === 'High' ? 'bg-red-50' :
                                        allergy.severity === 'Medium' ? 'bg-amber-50' :
                                            'bg-blue-50'
                                    }`}>
                                    {allergy.severity === 'High' ? (
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    ) : (
                                        <ShieldAlert className={`w-6 h-6 ${allergy.severity === 'Medium' ? 'text-amber-600' : 'text-blue-600'}`} />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-lg text-gray-900">{allergy.name}</h4>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${allergy.severity === 'High' ? 'bg-red-100 text-red-700' :
                                                allergy.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {allergy.severity} Severity
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm mb-2">
                                        <span className="font-semibold">Reaction:</span> {allergy.reactionType}
                                    </p>
                                    {allergy.notes && (
                                        <p className="text-gray-600 text-sm italic italic">
                                            Notes: {allergy.notes}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-3">
                                        Added: {new Date(allergy.dateAdded).toLocaleDateString()}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleRemoveAllergy(allergy.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-gray-300" />
                            </div>
                            <h4 className="text-gray-900 font-semibold mb-1">No allergies recorded</h4>
                            <p className="text-gray-500 mb-6">Start by adding any medication allergies you have.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="px-6 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-all border border-blue-200"
                            >
                                Add Your First Allergy
                            </button>
                        </div>
                    )}
                </div>

                {/* Disclaimer Card */}
                <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl flex gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div className="text-sm text-amber-800 leading-relaxed">
                        <p className="font-bold mb-1 text-base">Medical Record Disclaimer</p>
                        <p>
                            This information is for your personal pharmacy records and medication safety tracking.
                            Always consult with a healthcare professional before making any changes to your treatment or if you suspect a serious allergic reaction.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

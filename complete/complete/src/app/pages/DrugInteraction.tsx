import { useState, useEffect } from "react";
import {
    Pill,
    Activity,
    AlertCircle,
    FileText,
    ChevronLeft,
    LayoutDashboard,
    User,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkInteractions, getMyPrescriptions } from "../api";

/* ---------- Types ---------- */

interface Interaction {
    id: string;
    drugA: string;
    drugB: string;
    severity: "Severe" | "Moderate" | "Minor";
    explanation: string;
    type: "Cross-Prescription" | "Within-Prescription";
    source: string;
}

/* ---------- Component ---------- */

export default function DrugInteraction() {
    const navigate = useNavigate();
    const location = useLocation();

    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // If you passed prescription from previous page:
    const selectedPrescription = location.state?.prescription;

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Get all prescriptions
                const allPrescriptions = await getMyPrescriptions();

                // 2. Filter for ACTIVE medications
                const activePrescriptions = allPrescriptions.filter((p: any) => {
                    const status = (p.status || "").toUpperCase();
                    return ["ACTIVE", "UPLOADED", "OCR_PROCESSED"].includes(status) || !p.status;
                });

                // 3. Identify medicines to check
                let selectedMedicines: string[] = [];
                if (selectedPrescription) {
                    selectedMedicines = (selectedPrescription.medicines || []).map((m: any) =>
                        (typeof m === 'string' ? m : m.name).trim().toLowerCase()
                    );
                }

                const allMedicines: string[] = [];
                activePrescriptions.forEach((p: any) => {
                    (p.medicines || []).forEach((m: any) => {
                        const name = typeof m === 'string' ? m : m.name;
                        if (name) allMedicines.push(name.trim().toLowerCase());
                    });
                });

                // 4. Unique drugs for backend call
                const uniqueDrugs = [...new Set(allMedicines)];

                if (uniqueDrugs.length < 2) {
                    setInteractions([]);
                    setIsLoading(false);
                    return;
                }

                // 5. Call backend
                const results = await checkInteractions(uniqueDrugs);

                // 6. Map results
                const mapped: Interaction[] = results.map((res: any, index: number) => {
                    const drug1 = res.drug1.trim().toLowerCase();
                    const drug2 = res.drug2.trim().toLowerCase();

                    let type: "Within-Prescription" | "Cross-Prescription" = "Cross-Prescription";

                    if (selectedPrescription) {
                        // If BOTH drugs are in the selected prescription, it's WITHIN
                        const isD1InSelected = selectedMedicines.includes(drug1);
                        const isD2InSelected = selectedMedicines.includes(drug2);
                        if (isD1InSelected && isD2InSelected) {
                            type = "Within-Prescription";
                        }
                    } else {
                        // If NO specific prescription selected, check if they exist together in ANY single prescription
                        const togetherInAny = activePrescriptions.some((p: any) => {
                            const pMeds = (p.medicines || []).map((m: any) =>
                                (typeof m === 'string' ? m : m.name).trim().toLowerCase()
                            );
                            return pMeds.includes(drug1) && pMeds.includes(drug2);
                        });
                        if (togetherInAny) type = "Within-Prescription";
                    }

                    return {
                        id: String(index),
                        drugA: res.drug1.charAt(0).toUpperCase() + res.drug1.slice(1),
                        drugB: res.drug2.charAt(0).toUpperCase() + res.drug2.slice(1),
                        severity: "Moderate",
                        explanation: res.description,
                        type: type,
                        source: "RxBuddy Interaction Database"
                    };
                });

                setInteractions(mapped);
            } catch (err) {
                console.error("Error fetching interactions:", err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [selectedPrescription]);


    const withinCount = interactions.filter(i => i.type === "Within-Prescription").length;
    const crossCount = interactions.filter(i => i.type === "Cross-Prescription").length;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Analyzing drug interactions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Navbar */}
            <nav className="h-[64px] border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between sticky top-0 z-10">
                <span className="font-semibold text-[#2563EB] text-2xl">
                    RxBuddy
                </span>

                <div className="flex items-center gap-8">
                    <button
                        onClick={() => navigate("/dashboard/prescriptions")}
                        className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Prescriptions
                    </button>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-sm font-medium text-[#64748B] hover:text-[#0F172A] flex items-center gap-1"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </button>

                    <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center">
                        <User className="w-5 h-5 text-[#64748B]" />
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="max-w-[1100px] mx-auto px-6">
                <header className="py-12 text-center">
                    <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-semibold text-[#0F172A]">
                        Drug Interaction Review
                    </h1>
                    <p className="text-[#64748B] mt-2">
                        {selectedPrescription
                            ? `Reviewing ${selectedPrescription.name}`
                            : "Analyzing selected prescriptions"}
                    </p>
                </header>

                {/* Summary */}
                <div className="flex gap-5 flex-wrap">
                    <div className="bg-white border rounded-lg p-5 flex-1 min-w-[250px]">
                        <Activity className="w-4 h-4 text-red-600 mb-2" />
                        <span className="text-2xl font-bold text-red-600">
                            {interactions.length} Interaction{interactions.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="bg-white border rounded-lg p-5 flex-1 min-w-[250px]">
                        <FileText className="w-4 h-4 mb-2" />
                        <span className="text-2xl font-bold">
                            {crossCount} Cross-Prescription
                        </span>
                    </div>

                    <div className="bg-white border rounded-lg p-5 flex-1 min-w-[250px]">
                        <Pill className="w-4 h-4 mb-2" />
                        <span className="text-2xl font-bold">
                            {withinCount} Within-Prescription
                        </span>
                    </div>
                </div>

                {/* Interactions */}
                {interactions.length > 0 ? (
                    <section className="mt-16">
                        <h2 className="text-xl font-semibold mb-6">
                            Detected Interactions
                        </h2>

                        <div className="flex flex-col gap-4">
                            {interactions.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border-l-4 border-red-500 rounded-lg p-6 shadow-sm"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">
                                            {item.drugA} + {item.drugB}
                                        </h3>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.type === "Within-Prescription" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                            {item.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        {item.explanation}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-3">
                                        Source: {item.source}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <div className="mt-20 text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold">
                            No Interactions Found
                        </h2>
                        <p className="text-gray-500 mt-2">All medications appear to be safe to take together.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
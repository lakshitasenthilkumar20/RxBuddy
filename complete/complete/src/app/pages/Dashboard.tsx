import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { getMe, getMyPrescriptions, logout, checkInteractions, getAllergyRisks } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState("User");
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [allergyCount, setAllergyCount] = useState(0);
  const [lastPrescriptionDate, setLastPrescriptionDate] = useState("None");
  const [isLoading, setIsLoading] = useState(true);
  const [safetyStatus, setSafetyStatus] = useState({
    hasIssues: false,
    type: 'safe' as 'safe' | 'warning' | 'danger',
    message: 'No known issues',
    interactionCount: 0,
    allergyRiskCount: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [user, prescriptions, allergyRisks] = await Promise.all([
          getMe(),
          getMyPrescriptions(),
          getAllergyRisks()
        ]);

        console.log("Dashboard data loaded successfully:", {
          user: user.full_name,
          count: prescriptions.length,
          risks: allergyRisks.length
        });

        setUserName(user.full_name);
        setPrescriptionsCount(prescriptions.length);
        setAllergyCount(user.allergies ? user.allergies.length : 0);

        const activePrescriptions = prescriptions.filter((p: any) =>
          ["ACTIVE", "Active", "UPLOADED", "OCR_PROCESSED"].includes((p.status || "").toUpperCase()) || !p.status
        );

        if (prescriptions.length > 0) {
          const sorted = [...prescriptions].sort((a, b) => {
            const dateA = new Date(a.date || a.created_at || a.uploaded_at || 0).getTime();
            const dateB = new Date(b.date || b.created_at || b.uploaded_at || 0).getTime();
            return dateB - dateA;
          });
          const latest = sorted[0];
          let latestDate: Date;
          if (latest.date && typeof latest.date === 'string' && latest.date.includes('-')) {
            latestDate = new Date(latest.date.replace(/-/g, '/'));
          } else {
            latestDate = new Date(latest.date || latest.created_at || latest.uploaded_at || Date.now());
          }
          setLastPrescriptionDate(latestDate.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
        }

        // --- Perform Interaction Checks ---
        const allMedicines = activePrescriptions.flatMap((p: any) =>
          (p.medicines || []).map((m: any) => typeof m === 'string' ? m : m.name)
        ).filter(Boolean).map((m: string) => m.toLowerCase());

        const uniqueDrugs = [...new Set(allMedicines)];
        let interactionsCount = 0;

        if (uniqueDrugs.length >= 2) {
          const interactions = await checkInteractions(uniqueDrugs as string[]);
          interactionsCount = interactions.length;
        }

        const allergyRiskCount = allergyRisks.length;
        const totalIssues = interactionsCount + allergyRiskCount;

        if (totalIssues > 0) {
          let message = "";
          if (interactionsCount > 0 && allergyRiskCount > 0) {
            message = `${interactionsCount} Interactions & ${allergyRiskCount} Allergy Risks`;
          } else if (interactionsCount > 0) {
            message = `${interactionsCount} Interaction${interactionsCount > 1 ? 's' : ''} Detected`;
          } else {
            message = `${allergyRiskCount} Allergy Risk${allergyRiskCount > 1 ? 's' : ''} Detected`;
          }

          setSafetyStatus({
            hasIssues: true,
            type: 'danger',
            message: message,
            interactionCount: interactionsCount,
            allergyRiskCount: allergyRiskCount
          });
        } else {
          setSafetyStatus({
            hasIssues: false,
            type: 'safe',
            message: 'No known issues',
            interactionCount: 0,
            allergyRiskCount: 0
          });
        }

      } catch (err) {
        console.error("Dashboard terminal error:", err);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [navigate]);

  const recentActivity = prescriptionsCount > 0 ? [
    {
      id: 1,
      type: 'upload',
      description: `You have ${prescriptionsCount} prescriptions in your records`,
      timestamp: lastPrescriptionDate
    }
  ] : [
    {
      id: 1,
      type: 'info',
      description: 'Welcome to RxBuddy! Start by uploading a prescription.',
      timestamp: 'Just now'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-semibold text-blue-600">RxBuddy</div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(userName || "User").split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || "?"}
              </div>
              <span className="font-medium text-gray-900">{userName || "User"}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <button
                  onClick={() => navigate("/dashboard/settings")}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700"
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, {userName}
          </h2>
          <p className="text-gray-600">
            A comprehensive overview of your prescription history and medication safety.
          </p>
        </div>

        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Safety Summary
          </h3>
          <div className="grid md:grid-cols-3 gap-5 text-center">
            {/* Status */}
            <button
              onClick={() => navigate('/dashboard/prescriptions')}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all hover:shadow-md ${safetyStatus.type === 'safe'
                ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'
                : 'bg-rose-50 border-rose-100 hover:border-rose-300'
                }`}
            >
              <div className="mb-3">
                {safetyStatus.type === 'safe' ? (
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-rose-600" />
                )}
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Health Status</span>
              <p className={`text-xl font-bold ${safetyStatus.type === 'safe'
                ? 'text-emerald-700'
                : 'text-rose-700'
                }`}>
                {safetyStatus.message}
              </p>
            </button>

            {/* Interactions */}
            <button
              onClick={() => navigate('/dashboard/interactions')}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all hover:shadow-md ${safetyStatus.interactionCount > 0 ? 'bg-rose-50 border-rose-100 hover:border-rose-300' : 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'}`}
            >
              <div className="mb-3">
                <Shield className={`w-10 h-10 ${safetyStatus.interactionCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Drug Interactions</span>
              <p className={`text-xl font-bold ${safetyStatus.interactionCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {safetyStatus.interactionCount > 0
                  ? `${safetyStatus.interactionCount} Detected`
                  : 'Clear'}
              </p>
            </button>

            {/* Allergy Risks */}
            <button
              onClick={() => navigate('/dashboard/allergies')}
              className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center transition-all hover:shadow-md ${safetyStatus.allergyRiskCount > 0 ? 'bg-orange-50 border-orange-100 hover:border-orange-300' : 'bg-blue-50 border-blue-100 hover:border-blue-300'}`}
            >
              <div className="mb-3 text-center">
                <ShieldAlert className={`w-10 h-10 ${safetyStatus.allergyRiskCount > 0 ? 'text-orange-600' : 'text-blue-600'}`} />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">Allergy Risks</span>
              <p className={`text-xl font-bold ${safetyStatus.allergyRiskCount > 0 ? 'text-orange-700' : 'text-blue-700'}`}>
                {safetyStatus.allergyRiskCount > 0
                  ? `${safetyStatus.allergyRiskCount} Detected`
                  : 'None Detected'}
              </p>
            </button>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Record Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Total Prescriptions</span>
                </div>
                <span className="text-3xl font-bold text-blue-600">{prescriptionsCount}</span>
              </div>

              <div className="flex items-center justify-between p-5 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Allergies Recorded</span>
                </div>
                <span className="text-3xl font-bold text-amber-600">{allergyCount}</span>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  onClick={() => navigate('/dashboard/prescriptions')}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
                >
                  Manage Prescriptions
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 font-bold">
              Recent Activity
            </h3>
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${activity.type === 'upload' ? 'bg-blue-50' : 'bg-emerald-50'
                    }`}>
                    {activity.type === 'upload' ? (
                      <Upload className="w-6 h-6 text-blue-600" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 font-bold">
            Actions
          </h3>
          <div className="grid sm:grid-cols-3 gap-5">
            <button
              onClick={() => navigate('/dashboard/prescriptions')}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all group"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Upload className="w-7 h-7 text-blue-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-gray-900">Upload</span>
                <span className="text-sm text-gray-500">Digitalize Prescription</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/allergies')}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-amber-600 hover:bg-amber-50 transition-all group"
            >
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                <ShieldAlert className="w-7 h-7 text-amber-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-gray-900">Allergies</span>
                <span className="text-sm text-gray-500">Update Profile</span>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard/interactions')}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-rose-600 hover:bg-rose-50 transition-all group"
            >
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                <Shield className="w-7 h-7 text-rose-600 group-hover:text-white" />
              </div>
              <div className="text-left">
                <span className="block font-bold text-gray-900">Interactions</span>
                <span className="text-sm text-gray-500">Check Safety</span>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
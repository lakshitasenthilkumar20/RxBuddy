import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Shield, FileText, Database, Search, ClipboardCheck, User, Upload, FileSearch, Pill, CheckCircle, ShieldAlert } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-semibold text-blue-600">RxBuddy</div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            RxBuddy – Smart Prescription Digitalization and Medication Safety System
          </h1>
          <p className="text-lg text-gray-700 mb-10 leading-relaxed max-w-3xl mx-auto">
            RxBuddy is a healthcare software platform designed to convert handwritten prescriptions into structured digital data and perform medication safety checks, including drug–drug interaction analysis and personal allergy records.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="border-2 border-blue-600 text-blue-600 bg-white px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors text-lg font-medium"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* About the Project */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">About the Project</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            RxBuddy addresses common medication safety issues caused by handwritten prescriptions and limited patient awareness. The system digitizes prescription data using Optical Character Recognition (OCR), extracts medicine names, and evaluates them against known interaction datasets. Users can also maintain a secure profile of their medication allergies for better health management.
          </p>
        </div>
      </section>

      {/* The Problem We Are Solving */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">The Problem We Are Solving</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Illegible Prescriptions</h3>
              <p className="text-gray-700 leading-relaxed">
                Handwritten prescriptions are often difficult to interpret, leading to dispensing errors and patient confusion.
              </p>
            </div>

            {/* Problem 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Drug Interaction Oversight</h3>
              <p className="text-gray-700 leading-relaxed">
                Potential drug–drug interactions are rarely checked by patients, increasing the risk of adverse health outcomes.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Fragmented Information</h3>
              <p className="text-gray-700 leading-relaxed">
                Prescriptions are frequently lost or not digitally stored, making medication information inaccessible when needed.
              </p>
            </div>

            {/* Problem 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Allergy Tracking</h3>
              <p className="text-gray-700 leading-relaxed">
                Patients often lack a centralized place to record their medication allergies, which is critical for safe pharmacy visits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Capabilities */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">System Capabilities</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Capability 1 */}
            <div className="bg-blue-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSearch className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Prescription Digitalization</h3>
              <p className="text-gray-700">
                Converts prescription images into machine-readable text using Optical Character Recognition (OCR).
              </p>
            </div>

            {/* Capability 2 */}
            <div className="bg-blue-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Medicine Identification</h3>
              <p className="text-gray-700">
                Extracts and normalizes medicine names from unstructured text to ensure accurate recognition.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="bg-blue-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pill className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Drug Interaction Analysis</h3>
              <p className="text-gray-700">
                Identifies known contraindications and potential adverse effects between prescribed medicines.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="bg-blue-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Allergy Profile Management</h3>
              <p className="text-gray-700">
                Allows users to maintain a secure digital record of medication allergies for safe healthcare management.
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Capability 5 */}
            <div className="bg-blue-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Digital Prescription Records</h3>
              <p className="text-gray-700">
                Securely stores all digitized prescription data for future reference and comprehensive patient history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Workflow Overview */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">System Workflow Overview</h2>

          {/* Workflow Steps */}
          <div className="flex items-center justify-center flex-wrap gap-4 mb-12">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <User className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-900">User Login</p>
            </div>

            <div className="text-blue-600 text-3xl font-bold hidden sm:block">→</div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-900">Image Upload</p>
            </div>

            <div className="text-blue-600 text-3xl font-bold hidden sm:block">→</div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <FileSearch className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-900">OCR Extraction</p>
            </div>

            <div className="text-blue-600 text-3xl font-bold hidden sm:block">→</div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <Search className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-900">Medicine Identification</p>
            </div>

            <div className="text-blue-600 text-3xl font-bold hidden sm:block">→</div>

            {/* Step 5 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <ShieldAlert className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-900">Safety Verification</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 leading-relaxed">
              This structured workflow ensures accurate digitalization and comprehensive safety analysis of prescriptions.
            </p>
          </div>
        </div>
      </section>

      {/* Project Information */}
      <footer className="bg-gradient-to-br from-blue-50 to-blue-100 py-12 border-t border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Project Information</h3>
          <p className="text-gray-700 mb-2">
            <strong>Project Name:</strong> RxBuddy
          </p>
          <p className="text-gray-700 mb-4">
            Developed as an academic software project showcasing innovation in healthcare technology.
          </p>
          <p className="text-sm text-gray-600">
            © RxBuddy – Smart Prescription Digitalization and Medication Safety System
          </p>
        </div>
      </footer>
    </div>
  );
}
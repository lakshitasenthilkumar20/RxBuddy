import { Toaster } from "../components/ui/sonner";
import { SettingsHeader } from "../components/settings/settings-header";
import { PersonalInfoSection } from "../components/settings/personal-info-section";
import { PasswordSection } from "../components/settings/password-section";
import { DeleteAccountSection } from "../components/settings/delete-account-section";

export default function Settings() {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1100px] mx-auto px-6 py-12">
                <SettingsHeader />

                <div className="space-y-6">
                    <PersonalInfoSection />
                    <PasswordSection />
                    <DeleteAccountSection />
                </div>
            </div>

            <Toaster position="top-right" />
        </div>
    );
}

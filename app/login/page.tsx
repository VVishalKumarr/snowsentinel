"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Satellite, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/i18n";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { requestOtp, verifyOtp } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (phone.replace(/[^\d]/g, "").length < 7) {
      setError("Enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const result = await requestOtp(phone);
      setDemoOtp(result.demoMode ? result.otp ?? null : null);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone, otp, name || undefined);
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      if (/name is required/i.test(message)) {
        setIsNewUser(true);
        setError("Looks like you're new here — enter your name below too.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 border border-teal-200">
            <Satellite className="h-6 w-6 text-teal-700" strokeWidth={1.75} />
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-slate-900">{t("loginTitle")}</h1>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t("loginPhone")}</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? "…" : t("loginSendOtp")}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerify} className="space-y-4">
              {demoOtp && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    <strong>{t("loginDemoAuth")}</strong> — no SMS provider configured. Your code:{" "}
                    <span className="font-mono font-bold">{demoOtp}</span>
                  </span>
                </div>
              )}

              {isNewUser && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">{t("loginName")}</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Vishal"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t("loginOtp")}</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center font-mono text-lg tracking-[0.3em] outline-none focus:border-teal-400"
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? "…" : t("loginVerify")}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
              >
                Use a different number
              </button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Hackathon prototype — demo authentication only, no real SMS is sent.
        </p>
      </div>
    </div>
  );
}

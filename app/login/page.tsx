"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Satellite } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/i18n";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setName("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetFields();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("authInvalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t("authPasswordMismatch"));
      return;
    }
    setLoading(true);
    try {
      await register(name, username, password, confirmPassword);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("authUnableToCreate"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 border border-teal-200">
            <Satellite className="h-6 w-6 text-teal-700" strokeWidth={1.75} />
          </div>
          <h1 className="text-lg font-semibold tracking-[0.14em] text-slate-900">{t("appName").toUpperCase()}</h1>
          <p className="text-sm text-slate-500">{t("authTagline")}</p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t("authUsername")}</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t("authPassword")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? t("authLoggingIn") : t("authLogin")}
              </button>
              <p className="text-center text-xs text-slate-500">
                {t("authDontHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-semibold text-teal-700 hover:underline"
                >
                  {t("authCreateNewAccount")}
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-center text-sm font-semibold tracking-wide text-slate-800">
                {t("authCreateYourAccount")}
              </h2>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t("authFullName")}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t("authUsername")}</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="vishal123"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t("authPassword")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">{t("authConfirmPassword")}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading || !name || !username || !password || !confirmPassword}
                className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? t("authCreatingAccount") : t("authCreateAccount")}
              </button>
              <p className="text-center text-xs text-slate-500">
                {t("authAlreadyHaveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-teal-700 hover:underline"
                >
                  {t("authBackToLogin")}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

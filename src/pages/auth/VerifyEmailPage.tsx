import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { LoaderCircle, MailCheck } from "lucide-react";
import { buildApiUrl } from "../../services/api";

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    if (!token) return;
    window.location.replace(buildApiUrl(`/auth/verify-email/${encodeURIComponent(token)}`));
  }, [token]);

  if (!token) {
    return (
      <main className="min-h-screen bg-[#faf6ee] px-4 flex items-center justify-center">
        <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <MailCheck className="mx-auto h-12 w-12 text-rose-600" />
          <h1 className="mt-4 text-2xl font-bold text-emerald-950">Invalid verification link</h1>
          <p className="mt-2 text-sm text-emerald-950/70">This link is incomplete. Please use the full link from your email.</p>
          <Link to="/sign-in" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Go to login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf6ee] px-4 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-emerald-700" />
        <h1 className="mt-4 text-2xl font-bold text-emerald-950">Verifying your email</h1>
        <p className="mt-2 text-sm text-emerald-950/70">Please wait while we activate your IMARA account.</p>
      </section>
    </main>
  );
}

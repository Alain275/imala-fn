import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { authService } from "../../services/auth";

export default function EmailVerifiedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const fragmentParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = fragmentParams.get("token") || searchParams.get("token");
    const refreshToken = fragmentParams.get("refreshToken") || searchParams.get("refreshToken");

    if (!token) {
      setError("The verification link did not return a login token. Please sign in.");
      return;
    }

    const finishVerification = async () => {
      try {
        localStorage.setItem("token", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        const user = await authService.getProfile();
        window.dispatchEvent(new Event("user-updated"));

        if (user.role === "farmer") {
          navigate("/dashboard/farmer-profile", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch {
        authService.logout();
        setError("Your email was verified, but automatic login failed. Please sign in.");
      }
    };

    void finishVerification();
  }, [navigate, searchParams]);

  return (
    <main className="min-h-screen bg-[#faf6ee] px-4 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        {error ? (
          <>
            <CircleAlert className="mx-auto h-12 w-12 text-amber-600" />
            <h1 className="mt-4 text-2xl font-bold text-emerald-950">Account verified</h1>
            <p className="mt-2 text-sm text-emerald-950/70">{error}</p>
            <Link to="/sign-in" className="mt-6 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Sign in</Link>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" />
            <h1 className="mt-4 text-2xl font-bold text-emerald-950">Email verified</h1>
            <p className="mt-2 text-sm text-emerald-950/70">Your account is ready. We are opening your dashboard.</p>
            <LoaderCircle className="mx-auto mt-5 h-6 w-6 animate-spin text-emerald-700" />
          </>
        )}
      </section>
    </main>
  );
}

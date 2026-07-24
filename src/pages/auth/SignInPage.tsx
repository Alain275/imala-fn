import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../services/auth";
import { AuthShell } from "@/components/auth/AuthShell";

type TFunction = (key: string) => string;

const buildLoginSchema = (t: TFunction) =>
  z.object({
    email: z.string().email(t("auth.login.emailError")),
    password: z.string().min(6, t("auth.login.passwordError")),
  });

type LoginFormValues = z.infer<ReturnType<typeof buildLoginSchema>>;

const roleHome: Record<string, string> = {
  farmer: "/dashboard",
  "agro-dealer": "/agro-dealer",
  agronomist: "/agronomist",
  admin: "/admin",
  cooperative: "/cooperative",
};

const fieldClass =
  "h-12 w-full rounded-[6px] border border-[#cbdccf] bg-white pl-11 pr-4 text-sm text-[#17231b] outline-none transition placeholder:text-[#789082] focus:border-[#477326] focus:ring-4 focus:ring-[#9bf52e]/15";

export default function SignInPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loginSchema = useMemo(() => buildLoginSchema(t), [t, i18n.language]);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const emailField = register("email", { onChange: () => clearErrors("root.server") });
  const passwordField = register("password", { onChange: () => clearErrors("root.server") });

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    clearErrors("root.server");
    try {
      const response = await authService.login(data);
      toast.success(response.message || t("auth.login.successToast"));
      const user = response.data.user;
      const defaultHome = roleHome[user.role] ?? "/dashboard";
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from ?? defaultHome, { replace: true });
    } catch (error: any) {
      setError("root.server", {
        type: "server",
        message: error.response?.data?.message || t("auth.login.errorToast"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      mode="login"
      panelTitle={t("auth.login.panelTitle")}
      panelText={t("auth.login.panelText")}
      panelLink={t("auth.login.panelLink")}
      panelLinkTo="/register"
      homeLabel={t("common.home")}
    >
      <div className="w-full max-w-[470px]">
        <div className="mb-8">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#477326]">
            <span className="h-1.5 w-1.5 bg-[#8fe82e]" />
            {t("auth.ui.loginEyebrow")}
          </p>
          <h1 className="text-3xl font-black tracking-[-0.035em] text-[#17231b] sm:text-4xl">
            {t("auth.login.title")}
          </h1>
          <p className="mt-3 text-sm text-[#647b6b]">
            {t("auth.login.noAccount")}{" "}
            <Link to="/register" className="font-bold text-[#315900] underline decoration-[#9bdc50] underline-offset-4">
              {t("auth.login.createOne")}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {errors.root?.server?.message && (
            <div role="alert" className="flex gap-3 border-l-2 border-[#d51f2c] bg-[#fff3f3] px-4 py-3 text-sm text-[#a81722]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {errors.root.server.message}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="mb-2 block text-xs font-bold text-[#294535]">
              {t("auth.login.emailLabel")}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64806e]" />
              <input
                {...emailField}
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder={t("auth.login.emailPlaceholder")}
                aria-invalid={Boolean(errors.email)}
                className={fieldClass}
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-[#b4131e]">{errors.email.message}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="login-password" className="text-xs font-bold text-[#294535]">
                {t("auth.login.passwordLabel")}
              </label>
              <a href="#" className="text-xs font-bold text-[#477326] underline underline-offset-4 hover:text-[#315900]">
                {t("auth.login.forgotPassword")}
              </a>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64806e]" />
              <input
                {...passwordField}
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t("auth.login.passwordPlaceholder")}
                aria-invalid={Boolean(errors.password)}
                className={`${fieldClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={t(showPassword ? "auth.ui.hidePassword" : "auth.ui.showPassword")}
                className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-[#64806e] transition hover:text-[#315900]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-[#b4131e]">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#315900] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#b5ff62] shadow-[0_8px_24px_rgba(35,73,18,.16)] transition hover:bg-[#254500] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b5ff62]/30 border-t-[#b5ff62]" />
                {t("auth.login.submitting")}
              </>
            ) : (
              <>
                {t("auth.login.submit")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 border-t border-[#d7e5da] pt-5 text-center text-[10px] leading-5 text-[#789082]">
          {t("auth.ui.securityNote")}
        </p>
      </div>
    </AuthShell>
  );
}

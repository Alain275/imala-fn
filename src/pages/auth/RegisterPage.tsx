import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  Sprout,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../services/auth";
import { AuthShell } from "@/components/auth/AuthShell";

const phoneRegex = /^(?:\+250|0)?7[8923]\d{7}$/;
type TFunction = (key: string) => string;

const buildRegisterSchema = (t: TFunction) =>
  z
    .object({
      name: z.string().min(2, t("auth.register.fullNameError")),
      email: z.string().email(t("auth.register.emailError")),
      phone: z.string().regex(phoneRegex, t("auth.register.phoneError")),
      password: z.string().min(6, t("auth.register.passwordError")),
      confirmPassword: z.string().min(6, t("auth.register.confirmPasswordError")),
      role: z.enum(["farmer", "agro-dealer"]),
      location: z.string().optional(),
      farmSize: z.string().optional(),
      agree: z.boolean().refine((value) => value, { message: t("auth.register.agreeError") }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.register.passwordsMismatchError"),
      path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<ReturnType<typeof buildRegisterSchema>>;
const registerRoleOptions = ["farmer", "agro-dealer"] as const;

const fieldClass =
  "h-12 w-full rounded-[6px] border border-[#cbdccf] bg-white pl-11 pr-4 text-sm text-[#17231b] outline-none transition placeholder:text-[#789082] focus:border-[#477326] focus:ring-4 focus:ring-[#9bf52e]/15";

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);

  const registerSchema = useMemo(() => buildRegisterSchema(t), [t, i18n.language]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "farmer",
      location: "",
      farmSize: "",
      agree: false,
    },
  });

  const isAgreeChecked = watch("agree");
  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setSubmitting(true);
    try {
      const response = await authService.register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone.replace(/\s+/g, ""),
        location: data.location?.trim() || undefined,
        farmSize: data.farmSize ? parseFloat(data.farmSize) : undefined,
        role: data.role,
      });
      toast.success(response.message || t("auth.register.successToast"));
      setRegisteredEmail(response.data.email);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("auth.register.errorToast");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerification = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      const response = await authService.resendVerification(registeredEmail);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("auth.register.errorToast"));
    } finally {
      setResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#edf8f1] px-5 py-10">
        <section className="w-full max-w-md border border-[#d2e1d5] bg-white p-7 text-center shadow-[0_18px_50px_rgba(35,72,50,.08)] sm:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e8f8da] ring-8 ring-[#f4faef]">
            <Mail className="h-7 w-7 text-[#477326]" aria-hidden="true" />
          </div>
          <p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-[#477326]">
            {t("auth.ui.oneLastStep")}
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.025em] text-[#17231b]">
            {t("auth.register.checkEmailTitle")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#647b6b]">
            {t("auth.register.checkEmailText")}{" "}
            <strong className="break-all text-[#294535]">{registeredEmail}</strong>
          </p>
          <p className="mt-2 text-xs text-[#789082]">{t("auth.register.checkSpamText")}</p>
          <Link
            to="/sign-in"
            className="mt-7 flex h-12 w-full items-center justify-center rounded-[6px] bg-[#315900] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#b5ff62] hover:bg-[#254500]"
          >
            {t("auth.register.continueToLogin")}
          </Link>
          <button
            type="button"
            onClick={resendVerification}
            disabled={resending}
            className="mt-3 h-12 w-full rounded-[6px] border border-[#bdd0c1] text-xs font-bold text-[#31553f] hover:bg-[#f2f8f4] disabled:opacity-50"
          >
            {resending ? t("auth.register.resending") : t("auth.register.resend")}
          </button>
        </section>
      </main>
    );
  }

  const renderError = (message?: string) =>
    message ? <p className="mt-1.5 text-xs text-[#b4131e]">{message}</p> : null;

  return (
    <AuthShell
      mode="register"
      panelTitle={t("auth.register.panelTitle")}
      panelText={t("auth.register.panelText")}
      panelLink={t("auth.register.panelLink")}
      panelLinkTo="/sign-in"
      homeLabel={t("common.home")}
    >
      <div className="w-full max-w-[720px]">
        <div className="mb-8">
          <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#477326]">
            <span className="h-1.5 w-1.5 bg-[#8fe82e]" />
            {t("auth.ui.registerEyebrow")}
          </p>
          <h1 className="text-3xl font-black tracking-[-0.035em] text-[#17231b] sm:text-4xl">
            {t("auth.register.title")}
          </h1>
          <p className="mt-3 text-sm text-[#647b6b]">
            {t("auth.register.haveAccount")}{" "}
            <Link to="/sign-in" className="font-bold text-[#315900] underline decoration-[#9bdc50] underline-offset-4">
              {t("auth.register.logIn")}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
          <fieldset>
            <legend className="mb-3 text-xs font-bold text-[#294535]">
              {t("auth.register.accountTypeLabel")}
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {registerRoleOptions.map((roleOption) => {
                const selected = selectedRole === roleOption;
                const RoleIcon = roleOption === "farmer" ? Sprout : Building2;
                return (
                  <label
                    key={roleOption}
                    className={`relative flex cursor-pointer gap-3 rounded-[6px] border p-4 transition ${
                      selected
                        ? "border-[#477326] bg-[#f1f9ea] shadow-[inset_3px_0_0_#8fe82e]"
                        : "border-[#cbdccf] bg-white hover:border-[#86a88e]"
                    }`}
                  >
                    <input type="radio" value={roleOption} {...register("role")} className="sr-only" />
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[5px] ${selected ? "bg-[#315900] text-[#b5ff62]" : "bg-[#edf5ef] text-[#557160]"}`}>
                      <RoleIcon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-xs font-black text-[#294535]">
                        {t(`common.role.${roleOption}`)}
                      </span>
                      <span className="mt-1 block text-[10px] leading-4 text-[#647b6b]">
                        {t(`auth.register.accountTypeHelp.${roleOption}`)}
                      </span>
                    </span>
                    {selected && (
                      <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-[#8fe82e] text-[#173b24]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="register-name" className="mb-2 block text-xs font-bold text-[#294535]">
                {t("auth.register.fullNameLabel")}
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64806e]" />
                <input {...register("name")} id="register-name" type="text" autoComplete="name" placeholder={t("auth.register.fullNamePlaceholder")} className={fieldClass} />
              </div>
              {renderError(errors.name?.message)}
            </div>

            <div>
              <label htmlFor="register-email" className="mb-2 block text-xs font-bold text-[#294535]">
                {t("auth.register.emailLabel")}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64806e]" />
                <input {...register("email")} id="register-email" type="email" autoComplete="email" placeholder={t("auth.register.emailPlaceholder")} className={fieldClass} />
              </div>
              {renderError(errors.email?.message)}
            </div>

            <div>
              <label htmlFor="register-phone" className="mb-2 block text-xs font-bold text-[#294535]">
                {t("auth.register.phoneLabel")}
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64806e]" />
                <input {...register("phone")} id="register-phone" type="tel" autoComplete="tel" placeholder={t("auth.register.phonePlaceholder")} className={fieldClass} />
              </div>
              {renderError(errors.phone?.message)}
            </div>

            <div>
              <label htmlFor="register-location" className="mb-2 block text-xs font-bold text-[#294535]">
                {t("auth.register.locationLabel")}
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64806e]" />
                <input {...register("location")} id="register-location" type="text" autoComplete="address-level2" placeholder={t("auth.register.locationPlaceholder")} className={fieldClass} />
              </div>
              {renderError(errors.location?.message)}
            </div>

            {selectedRole === "farmer" && (
              <div>
                <label htmlFor="register-farm-size" className="mb-2 block text-xs font-bold text-[#294535]">
                  {t("auth.register.farmSizeLabel")}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#64806e]">m²</span>
                  <input {...register("farmSize")} id="register-farm-size" type="number" min="1" step="1" inputMode="numeric" placeholder={t("auth.register.farmSizePlaceholder")} className={fieldClass} />
                </div>
                {renderError(errors.farmSize?.message)}
              </div>
            )}

            <div>
              <label htmlFor="register-password" className="mb-2 block text-xs font-bold text-[#294535]">
                {t("auth.register.passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64806e]" />
                <input {...register("password")} id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder={t("auth.register.passwordPlaceholder")} className={`${fieldClass} pr-12`} />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={t(showPassword ? "auth.ui.hidePassword" : "auth.ui.showPassword")} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-[#64806e] hover:text-[#315900]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {renderError(errors.password?.message)}
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="mb-2 block text-xs font-bold text-[#294535]">
                {t("auth.register.confirmPasswordLabel")}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64806e]" />
                <input {...register("confirmPassword")} id="register-confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder={t("auth.register.confirmPasswordPlaceholder")} className={`${fieldClass} pr-12`} />
                <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={t(showConfirmPassword ? "auth.ui.hidePassword" : "auth.ui.showPassword")} className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-[#64806e] hover:text-[#315900]">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {renderError(errors.confirmPassword?.message)}
            </div>
          </div>

          <div>
            <label className="group flex cursor-pointer items-start gap-3">
              <input type="checkbox" {...register("agree")} className="sr-only" />
              <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border transition ${isAgreeChecked ? "border-[#315900] bg-[#315900] text-[#b5ff62]" : "border-[#aebfb2] bg-white group-hover:border-[#477326]"}`}>
                {isAgreeChecked && <Check className="h-3 w-3 stroke-[3]" />}
              </span>
              <span className="text-xs leading-5 text-[#647b6b]">
                {t("auth.register.agreeText")}
                <a href="#" className="font-bold text-[#315900] underline underline-offset-4">
                  {t("auth.register.agreeLink")}
                </a>
              </span>
            </label>
            {renderError(errors.agree?.message)}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#315900] px-5 text-xs font-black uppercase tracking-[0.14em] text-[#b5ff62] shadow-[0_8px_24px_rgba(35,73,18,.16)] transition hover:bg-[#254500] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b5ff62]/30 border-t-[#b5ff62]" />
                {t("auth.register.submitting")}
              </>
            ) : (
              <>
                {t("auth.register.submit")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}

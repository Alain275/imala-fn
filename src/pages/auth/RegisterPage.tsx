import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../services/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Rwandan phone regex: starting with 078/079/072/073 or +25078/etc followed by 7 digits
const phoneRegex = /^(?:\+250|0)?7[8923]\d{7}$/;

type TFunction = (key: string) => string;

const buildRegisterSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(2, t("auth.register.fullNameError")),
    email: z.string().email(t("auth.register.emailError")),
    phone: z.string().regex(phoneRegex, t("auth.register.phoneError")),
    password: z.string().min(6, t("auth.register.passwordError")),
    confirmPassword: z.string().min(6, t("auth.register.confirmPasswordError")),
    location: z.string().optional(),
    farmSize: z.string().optional(),
    agree: z.boolean().refine(val => val === true, {
      message: t("auth.register.agreeError")
    })
  }).refine(data => data.password === data.confirmPassword, {
    message: t("auth.register.passwordsMismatchError"),
    path: ["confirmPassword"]
  });

type RegisterFormValues = z.infer<ReturnType<typeof buildRegisterSchema>>;

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const registerSchema = useMemo(() => buildRegisterSchema(t), [t, i18n.language]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      location: "",
      farmSize: "",
      agree: false
    }
  });

  const isAgreeChecked = watch("agree");

  const onSubmit = async (data: RegisterFormValues) => {
    setSubmitting(true);
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        location: data.location,
        farmSize: data.farmSize ? parseFloat(data.farmSize) : undefined,
        role: 'farmer'
      });

      toast.success(response.message || t("auth.register.successToast"));

      // Redirect based on role
      const user = response.data.user;
      if (user.role === "agronomist") {
        navigate("/agronomist");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t("auth.register.errorToast");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] relative overflow-hidden flex items-stretch">
      {/* Dynamic background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#f6ebd5]/60 blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[30%] w-[45vw] h-[45vw] rounded-full bg-[#f6ebd5]/40 blur-3xl -z-10" />
      <div className="absolute top-[40%] left-[20%] w-80 h-80 rounded-full bg-[#f6ebd5]/50 blur-2xl -z-10" />

      {/* Main Container */}
      <div className="w-full grid lg:grid-cols-12 min-h-screen z-10 items-stretch">

        {/* Left Side: Register Form */}
        <div className="lg:col-span-7 px-6 py-12 sm:px-12 lg:px-20 flex flex-col justify-center items-center relative bg-transparent">

          {/* Back button */}
          <div className="mb-6 flex justify-between items-center w-full max-w-lg">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> {t("common.home")}
            </Link>

            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="flex items-center gap-2 lg:hidden">
                <span className="text-xl font-bold text-emerald-800 tracking-wider">IMARA</span>
              </div>

              <LanguageSwitcher
                triggerClassName="border-emerald-200 bg-white/60 text-emerald-800 hover:bg-emerald-50"
              />
            </div>
          </div>

          <div className="w-full max-w-lg">
            <h1 className="text-3xl font-bold text-emerald-950 mb-6">{t("auth.register.title")}</h1>



            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                {/* Full Name */}
                <div className="relative md:col-span-2">
                  <span className="absolute left-3 -top-2 bg-[#faf6ee] px-1.5 text-[11px] font-semibold text-emerald-800 tracking-wide z-10">
                    {t("auth.register.fullNameLabel")}
                  </span>
                  <div className="flex items-center rounded-xl border border-[#e0d6bc] bg-[#faf6ee]/20 px-3.5 py-3.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                    <User className="w-4 h-4 text-emerald-700/50 mr-2.5 flex-shrink-0" />
                    <input
                      {...register("name")}
                      type="text"
                      placeholder={t("auth.register.fullNamePlaceholder")}
                      className="w-full bg-transparent text-sm text-emerald-950 placeholder-emerald-950/30 outline-none"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] text-rose-600 mt-1 pl-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <span className="absolute left-3 -top-2 bg-[#faf6ee] px-1.5 text-[11px] font-semibold text-emerald-800 tracking-wide z-10">
                    {t("auth.register.emailLabel")}
                  </span>
                  <div className="flex items-center rounded-xl border border-[#e0d6bc] bg-[#faf6ee]/20 px-3.5 py-3.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                    <Mail className="w-4 h-4 text-emerald-700/50 mr-2.5 flex-shrink-0" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder={t("auth.register.emailPlaceholder")}
                      className="w-full bg-transparent text-sm text-emerald-950 placeholder-emerald-950/30 outline-none"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-600 mt-1 pl-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Telephone Number */}
                <div className="relative">
                  <span className="absolute left-3 -top-2 bg-[#faf6ee] px-1.5 text-[11px] font-semibold text-emerald-800 tracking-wide z-10">
                    {t("auth.register.phoneLabel")}
                  </span>
                  <div className="flex items-center rounded-xl border border-[#e0d6bc] bg-[#faf6ee]/20 px-3.5 py-3.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                    <Phone className="w-4 h-4 text-emerald-700/50 mr-2.5 flex-shrink-0" />
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder={t("auth.register.phonePlaceholder")}
                      className="w-full bg-transparent text-sm text-emerald-950 placeholder-emerald-950/30 outline-none"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1 pl-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <span className="absolute left-3 -top-2 bg-[#faf6ee] px-1.5 text-[11px] font-semibold text-emerald-800 tracking-wide z-10">
                    {t("auth.register.passwordLabel")}
                  </span>
                  <div className="flex items-center rounded-xl border border-[#e0d6bc] bg-[#faf6ee]/20 px-3.5 py-3.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                    <Lock className="w-4 h-4 text-emerald-700/50 mr-2.5 flex-shrink-0" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.register.passwordPlaceholder")}
                      className="w-full bg-transparent text-sm text-emerald-950 placeholder-emerald-950/30 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-emerald-700/50 hover:text-emerald-800 transition-colors ml-2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-600 mt-1 pl-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <span className="absolute left-3 -top-2 bg-[#faf6ee] px-1.5 text-[11px] font-semibold text-emerald-800 tracking-wide z-10">
                    {t("auth.register.confirmPasswordLabel")}
                  </span>
                  <div className="flex items-center rounded-xl border border-[#e0d6bc] bg-[#faf6ee]/20 px-3.5 py-3.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                    <Lock className="w-4 h-4 text-emerald-700/50 mr-2.5 flex-shrink-0" />
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("auth.register.confirmPasswordPlaceholder")}
                      className="w-full bg-transparent text-sm text-emerald-950 placeholder-emerald-950/30 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-emerald-700/50 hover:text-emerald-800 transition-colors ml-2"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-rose-600 mt-1 pl-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Location */}
                <div className="relative">
                  <span className="absolute left-3 -top-2 bg-[#faf6ee] px-1.5 text-[11px] font-semibold text-emerald-800 tracking-wide z-10">
                    {t("auth.register.locationLabel")}
                  </span>
                  <div className="flex items-center rounded-xl border border-[#e0d6bc] bg-[#faf6ee]/20 px-3.5 py-3.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                    <MapPin className="w-4 h-4 text-emerald-700/50 mr-2.5 flex-shrink-0" />
                    <input
                      {...register("location")}
                      type="text"
                      placeholder={t("auth.register.locationPlaceholder")}
                      className="w-full bg-transparent text-sm text-emerald-950 placeholder-emerald-950/30 outline-none"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-[11px] text-rose-600 mt-1 pl-1">{errors.location.message}</p>
                  )}
                </div>

                {/* Farm Size */}
                <div className="relative">
                  <span className="absolute left-3 -top-2 bg-[#faf6ee] px-1.5 text-[11px] font-semibold text-emerald-800 tracking-wide z-10">
                    {t("auth.register.farmSizeLabel")}
                  </span>
                  <div className="flex items-center rounded-xl border border-[#e0d6bc] bg-[#faf6ee]/20 px-3.5 py-3.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600/20 transition-all">
                    <span className="text-emerald-700/50 text-sm mr-2.5 flex-shrink-0">ha</span>
                    <input
                      {...register("farmSize")}
                      type="number"
                      step="0.1"
                      placeholder={t("auth.register.farmSizePlaceholder")}
                      className="w-full bg-transparent text-sm text-emerald-950 placeholder-emerald-950/30 outline-none"
                    />
                  </div>
                  {errors.farmSize && (
                    <p className="text-[11px] text-rose-600 mt-1 pl-1">{errors.farmSize.message}</p>
                  )}
                </div>
              </div>

              {/* Agreement checkbox */}
              <div className="mt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      {...register("agree")}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                      isAgreeChecked
                        ? "bg-gradient-to-r from-emerald-600 to-green-600 border-emerald-600"
                        : "border-[#e0d6bc] bg-white group-hover:border-emerald-600"
                    }`}>
                      {isAgreeChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />}
                    </div>
                  </div>
                  <span className="text-xs text-emerald-900/80 select-none">
                    {t("auth.register.agreeText")}<a href="#" className="underline font-semibold text-emerald-800 hover:text-emerald-600">{t("auth.register.agreeLink")}</a>
                  </span>
                </label>
                {errors.agree && (
                  <p className="text-[11px] text-rose-600 mt-1.5 pl-1">{errors.agree.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm shadow-[0_8px_20px_-6px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_24px_-4px_rgba(16,185,129,0.4)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("auth.register.submitting")}
                  </>
                ) : (
                  t("auth.register.submit")
                )}
              </button>
            </form>
          </div>

          {/* Switch link for Mobile View */}
          <div className="mt-8 text-center lg:hidden">
            <p className="text-xs text-emerald-900/60">
              {t("auth.register.haveAccount")}{" "}
              <Link to="/sign-in" className="font-bold text-emerald-800 hover:text-emerald-600 underline">
                {t("auth.register.logIn")}
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Giant circle overlay stretching full-screen height */}
        <div className="hidden lg:col-span-4 lg:flex relative overflow-hidden items-center justify-center h-full min-h-screen">

          {/* Giant circle element extending leftwards */}
          <div className="">

            {/* Content inside the giant circle */}
            <div className="max-w-sm text-center space-y-6 relative z-10 px-10">
              <div className="flex justify-center mb-1">
                <img
                  src="/crop advisory.png"
                  alt="Crop Advisory"
                  className="w-50 h-50 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]"
                />
              </div>

              <h2 className="text-4xl font-extrabold tracking-tight text-emerald-700 drop-shadow-sm">{t("auth.register.panelTitle")}</h2>

              <p className="text-emerald-900/80 text-sm font-light leading-relaxed">
                {t("auth.register.panelText")}
              </p>

              <Link
                to="/sign-in"
                className="inline-block px-10 py-3 rounded-xl border-2 border-emerald-600 hover:border-emerald-700 text-emerald-700 hover:text-emerald-800 font-bold text-xs uppercase tracking-wider bg-transparent hover:bg-emerald-50/30 transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(5,150,105,0.15)]"
              >
                {t("auth.register.panelLink")}
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

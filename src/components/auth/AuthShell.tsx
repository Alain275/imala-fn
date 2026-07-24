import type { ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, Radio, ShieldCheck, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface AuthShellProps {
  children: ReactNode;
  panelTitle: string;
  panelText: string;
  panelLink: string;
  panelLinkTo: string;
  homeLabel: string;
  mode: "login" | "register";
}

export function AuthShell({
  children,
  panelTitle,
  panelText,
  panelLink,
  panelLinkTo,
  homeLabel,
  mode,
}: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-[#edf8f1] text-[#17231b]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(340px,42%)_1fr]">
        <aside className="relative hidden min-h-screen overflow-hidden bg-[#153923] px-10 py-9 text-white lg:flex lg:flex-col xl:px-14 xl:py-11">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full border border-[#9bf52e]/20" />
          <div className="pointer-events-none absolute -right-10 -top-6 h-52 w-52 rounded-full border border-[#9bf52e]/20" />
          <div className="relative z-10 flex items-center gap-3">
            <img src="/icon.svg" alt="" className="h-10 w-10 rounded-[8px]" />
            <div>
              <p className="text-lg font-black leading-none tracking-[0.18em]">IMARA</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/50">
                {t("auth.ui.fieldIntelligence")}
              </p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-xl py-16">
            <div className="mb-7 inline-flex items-center gap-2 border border-white/15 bg-white/[0.06] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b5f66f]">
              <Radio className="h-3.5 w-3.5" />
              {t(mode === "login" ? "auth.ui.loginStatus" : "auth.ui.registerStatus")}
            </div>
            <h2 className="max-w-lg text-4xl font-black leading-[1.08] tracking-[-0.04em] xl:text-5xl">
              {panelTitle}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/65 xl:text-base">
              {panelText}
            </p>

            <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
              <div className="border border-white/10 bg-white/[0.055] p-4">
                <ShieldCheck className="h-5 w-5 text-[#9bf52e]" />
                <p className="mt-5 text-xs font-bold">{t("auth.ui.secureTitle")}</p>
                <p className="mt-1 text-[10px] leading-4 text-white/45">{t("auth.ui.secureText")}</p>
              </div>
              <div className="border border-white/10 bg-white/[0.055] p-4">
                <Sprout className="h-5 w-5 text-[#9bf52e]" />
                <p className="mt-5 text-xs font-bold">{t("auth.ui.growersTitle")}</p>
                <p className="mt-1 text-[10px] leading-4 text-white/45">{t("auth.ui.growersText")}</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
              IMARA / Rwanda
            </span>
            <Link
              to={panelLinkTo}
              className="group inline-flex items-center gap-2 text-xs font-bold text-[#b5f66f] transition hover:text-white"
            >
              {panelLink}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </aside>

        <section className="flex min-h-screen min-w-0 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-[#d7e5da] bg-white/70 px-5 backdrop-blur sm:px-8 xl:px-12">
            <Link
              to="/"
              className="inline-flex min-h-10 items-center gap-2 text-xs font-bold text-[#31553f] transition hover:text-[#173b24]"
            >
              <ArrowLeft className="h-4 w-4" />
              {homeLabel}
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 lg:hidden">
                <img src="/icon.svg" alt="" className="h-8 w-8 rounded-[7px]" />
                <span className="text-sm font-black tracking-[0.16em] text-[#173b24]">IMARA</span>
              </div>
              <LanguageSwitcher
                triggerClassName="rounded-[5px] border-[#cadbce] bg-white text-[#31553f] hover:bg-[#f2f8f4]"
                contentClassName="light"
              />
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:py-12 xl:px-12">
            {children}
          </div>

          <div className="border-t border-[#d7e5da] bg-white/50 px-5 py-4 text-center text-xs text-[#557160] lg:hidden">
            <Link to={panelLinkTo} className="font-bold text-[#315900] underline underline-offset-4">
              {panelLink}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

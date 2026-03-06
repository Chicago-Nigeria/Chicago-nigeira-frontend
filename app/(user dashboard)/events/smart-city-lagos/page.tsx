import type { Metadata } from "next";
import Image from "next/image";
import QualificationFunnel from "./QualificationFunnel";

export const metadata: Metadata = {
  title: "SMART City Lagos Property Show — Private Investor Briefing | Chicago Nigerians",
  description:
    "Exclusive investor networking cocktail in Chicago. Private access to high-growth residential, commercial & mixed-use developments in Lagos' Lekki Free Zone.",
  openGraph: {
    title: "SMART City Lagos — Private Investor Briefing | March 15, 2026",
    description:
      "By invitation only. Join select investors and business leaders on March 15th at 6 PM for a private briefing on Alaro City — a 2,000-hectare master-planned city in Lagos's Lekki Free Zone.",
    images: ["/smart-city-lagos-banner.jpg"],
  },
};

export default function SmartCityLagosPage() {
  return (
    <div className="font-sans selection:bg-[var(--primary-color)]/30">
      {/* Background ambient light */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-[radial-gradient(ellipse_at_top_center,_var(--primary-color-light)_0%,_transparent_60%)] opacity-50 pointer-events-none z-0"></div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center">

          {/* Left: Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <p className="text-[var(--primary-color)] text-xs sm:text-sm md:text-base font-semibold tracking-[4px] uppercase mb-4 md:mb-6 flex items-center lg:justify-start justify-center gap-3">
              <span className="w-12 h-px bg-[var(--primary-color)]/50 hidden lg:block"></span>
              Private Investor Briefing
              <span className="w-8 md:w-12 h-px bg-[var(--primary-color)]/50 lg:hidden"></span>
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight tracking-tight">
              SMART City Lagos
              <br className="hidden md:block" />
              <span className="block text-[var(--primary-color)] mt-2">
                Exclusive Opportunity
              </span>
            </h1>
            <p className="text-gray-600 text-base md:text-xl leading-relaxed mb-8 md:mb-10 max-w-2xl font-light">
              By invitation only. Join select investors and business leaders on
              <span className="text-gray-900 font-medium"> March 15th at 6 PM</span> for a private briefing on Alaro City — a 2,000-hectare master-planned city in Lagos&apos;s Lekki Free Zone.
            </p>
            <a href="#apply" className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 bg-[var(--primary-color)] text-white text-base md:text-lg font-semibold rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-[var(--primary-color)]/90">
              Request Your Invitation
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>

          {/* Right: IG Flyer */}
          <div className="flex justify-center lg:justify-end relative mt-2 md:mt-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-color-light)] to-transparent blur-[80px] opacity-60 rounded-full w-full h-full pointer-events-none"></div>
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-[var(--primary-color)] rounded-[2rem] blur-md opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <Image
                src="/smart-city-lagos-banner.jpg"
                alt="SMART City Lagos — Private Real Estate Investment Briefing"
                width={540}
                height={960}
                className="relative w-full max-w-[340px] md:max-w-[420px] rounded-3xl shadow-2xl border border-gray-200 group-hover:scale-[1.02] transition-transform duration-500 object-cover"
                priority
                quality={90}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Value Props Section */}
      <div className="relative py-24 border-y border-gray-200 bg-white/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Why Alaro City, Lekki Free Zone?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
              Located in one of Africa&apos;s most significant investment corridors, Alaro City represents a
              once-in-a-generation opportunity for forward-thinking investors.
            </p>
          </div>

          {/* Key highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gap-y-12 mb-24">
            {[
              { stat: "2,000", label: "Hectares of Master-Planned Development" },
              { stat: "Deep Sea", label: "Adjacent to Lekki Deep Sea Port" },
              { stat: "Multi-Use", label: "Residential, Commercial & Industrial" }
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-white border border-gray-200 hover:border-[var(--primary-color)]/30 rounded-3xl p-8 sm:p-10 text-center transition-all duration-500 overflow-hidden shadow-sm hover:shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-[var(--primary-color)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="text-4xl md:text-5xl font-bold text-[var(--primary-color)] mb-4 transition-all duration-500">{item.stat}</div>
                <div className="text-sm md:text-base text-gray-500 uppercase tracking-[2px] font-medium transition-colors group-hover:text-gray-700">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Investment highlights */}
          <div className="mx-auto max-w-4xl relative">
            <div className="absolute -inset-1 bg-[var(--primary-color-light)] rounded-[2.5rem] blur-xl opacity-60 pointer-events-none"></div>
            <div className="relative bg-white border border-gray-200 rounded-[2.5rem] p-6 sm:p-8 md:p-14 shadow-xl">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 sm:mb-10 text-center">What You&apos;ll Learn at the Briefing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {[
                  "Detailed overview of Alaro City and the Lekki Free Zone investment landscape",
                  "Residential, commercial, and industrial investment opportunities",
                  "Infrastructure developments driving property value — deep sea port & international airport",
                  "How diaspora investors are positioning for high-growth returns in Lagos",
                  "Direct networking with fellow investors and business leaders in Chicago",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 sm:gap-5">
                    <div className="mt-1 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--primary-color-light)] border border-[var(--primary-color)]/20 shrink-0">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[var(--primary-color)] shadow-sm"></div>
                    </div>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA to funnel */}
      <div className="relative py-24">
        <div className="absolute top-0 inset-x-0 h-[300px] bg-[radial-gradient(ellipse_at_top_center,_var(--primary-color-light)_0%,_transparent_50%)] opacity-40 pointer-events-none z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-6 text-center mb-16">
          <p className="text-[var(--primary-color)] text-sm md:text-base tracking-[4px] uppercase mb-4 font-semibold">Limited Availability</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Apply for Your Invitation</h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto font-light">
            This event is limited to 50 qualified investors. Complete the short qualification below to request your invitation.
          </p>
        </div>

        {/* Qualification Funnel */}
        <div id="apply" className="relative z-10">
          <QualificationFunnel />
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center py-12 px-4 sm:px-6 border-t border-gray-200 bg-white/40">
        <p className="text-gray-500 text-sm uppercase tracking-widest flex max-sm:flex-col items-center justify-center gap-2 sm:gap-3">
          <span>Hosted by Chicago Nigerians</span>
          <span className="text-gray-300">&bull;</span>
          <a href="https://chicagonigerians.com" className="hover:text-[var(--primary-color)] transition-colors duration-300">chicagonigerians.com</a>
        </p>
      </div>
    </div>
  );
}

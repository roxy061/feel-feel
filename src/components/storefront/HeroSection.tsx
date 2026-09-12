import { ArrowDown, ShoppingBag, Sparkles } from "lucide-react";

interface HeroSectionProps {
  storeName: string;
  description: string | null;
  tagline: string | null;
  decorativeText: string | null;
  videoUrl?: string | null;
  bannerUrl?: string | null;
}

export default function HeroSection({
  storeName,
  description,
  tagline,
  decorativeText,
  videoUrl,
  bannerUrl,
}: HeroSectionProps) {
  const fallbackVideo =
    "https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-dark-tunnel-43846-large.mp4";
  const fallbackPoster =
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80";

  const displayDecorative = decorativeText || storeName.toUpperCase();
  const displayTagline = tagline || "PRECISION & SPEED CRAFTED FOR THE FUTURE";
  const displayDescription =
    description ||
    "สัมผัสประสบการณ์แห่งความเร็วและสมรรถนะระดับสูง คัดสรรชิ้นส่วนและอุปกรณ์มาตรฐานมอเตอร์สปอร์ตเพื่อยนตรกรรมของคุณ";

  return (
    <section className="relative w-full min-h-[600px] max-h-[965px] h-[85vh] overflow-hidden flex flex-col justify-between">
      {/* 1. Cinematic Background Poster Image (Guaranteed fallback layer) */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0 brightness-[0.65] contrast-[1.15]"
        style={{ backgroundImage: `url(${bannerUrl || fallbackPoster})` }}
      />

      {/* Cinematic Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster={bannerUrl || fallbackPoster}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 brightness-[0.65] contrast-[1.15]"
      >
        <source src={videoUrl || fallbackVideo} type="video/mp4" />
      </video>

      {/* Subtle Tint Layer */}
      <div className="absolute inset-0 bg-[#010101]/35 pointer-events-none z-0" />

      {/* 2. Top Gradient Overlay: 260px from black/80 via black/30 to transparent */}
      <div
        className="absolute top-0 inset-x-0 h-[260px] bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* 3. Bottom Gradient Overlay: 260px from #010101 via #010101/60 to transparent */}
      <div
        className="absolute bottom-0 inset-x-0 h-[260px] bg-gradient-to-t from-[#010101] via-[#010101]/60 to-transparent pointer-events-none z-10"
        aria-hidden="true"
      />

      {/* Spacer for Top Navbar (Navbar is rendered above or inside) */}
      <div className="h-24 w-full relative z-20" />

      {/* 4. Giant Decorative Typography: width 75%, center, vertical gradient from white 83% to 12% */}
      <div className="relative z-20 w-[75%] max-w-6xl mx-auto flex items-center justify-center pointer-events-none select-none my-auto">
        <h1 className="font-bebas tracking-tight uppercase text-center text-5xl sm:text-7xl md:text-8xl lg:text-[120px] xl:text-[150px] leading-[0.86] bg-gradient-to-b from-[rgba(255,255,255,0.83)] to-[rgba(255,255,255,0.12)] bg-clip-text text-transparent drop-shadow-2xl">
          {displayDecorative}
        </h1>
      </div>

      {/* 5. Split-Screen CTA at Bottom */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6 border-t border-[#EEEFF2]/10">
          {/* Left: Store Description + Primary 12px Radius Button */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#272835]/80 border border-[#EEEFF2]/20 text-xs font-mono text-[#EEEFF2] mb-3 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase tracking-wide">3NFM Performance Spec</span>
            </div>
            <p className="font-sans text-sm sm:text-base text-[#EEEFF2]/80 leading-relaxed mb-6 font-normal">
              {displayDescription}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#products-catalog"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] font-semibold text-sm transition-all shadow-xl active:scale-95 group cursor-pointer"
              >
                <span>เลือกดูสินค้าในร้าน</span>
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </a>
              <a
                href="#products-catalog"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#272835]/80 hover:bg-[#272835] border border-[#EEEFF2]/20 text-[#EEEFF2] text-sm font-medium transition-all backdrop-blur-sm"
              >
                <ShoppingBag className="w-4 h-4 text-[#EEEFF2]/70" />
                <span>สินค้าทั้งหมด</span>
              </a>
            </div>
          </div>

          {/* Right: Tagline in Bebas Neue font at 64px */}
          <div className="max-w-xl lg:text-right">
            <div className="font-bebas text-3xl sm:text-5xl lg:text-[64px] leading-[0.95] text-[#EEEFF2] tracking-wide uppercase drop-shadow-md">
              {displayTagline}
            </div>
            <div className="font-mono text-xs text-[#EEEFF2]/50 mt-2 uppercase tracking-widest">
              High-Velocity Commerce &bull; Authenticated Merchant
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

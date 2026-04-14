import heroImage from "@/assets/hero-medical.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-primary/95 via-primary/85 to-primary/70" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-6 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-primary-foreground/90 text-sm font-cairo">
              منصة طبية متكاملة وآمنة
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            تحاليلك الطبية
            <br />
            <span className="text-accent">في مكان واحد</span>
          </h1>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed max-w-lg animate-fade-up" style={{ animationDelay: "0.2s" }}>
            منصة ذكية تربط بين المريض والطبيب والمختبر لمتابعة التحاليل الطبية بسهولة وأمان تام.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <button className="bg-accent text-accent-foreground px-8 py-3.5 rounded-lg font-semibold text-lg hover:brightness-110 transition-all shadow-lg hover:shadow-xl">
              ابدأ الآن مجاناً
            </button>
            <button className="border-2 border-primary-foreground/30 text-primary-foreground px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-primary-foreground/10 transition-all backdrop-blur-sm">
              اعرف أكثر
            </button>
          </div>

          <div className="flex items-center gap-8 mt-10 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            {[
              { num: "+5000", label: "مريض" },
              { num: "+200", label: "طبيب" },
              { num: "+50", label: "مختبر" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">{stat.num}</div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

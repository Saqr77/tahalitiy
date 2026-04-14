const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="relative rounded-2xl overflow-hidden bg-primary px-8 py-16 md:py-20 text-center">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-accent/10 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-accent/10 translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              جاهز لإدارة تحاليلك بذكاء؟
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
              انضم إلى آلاف المستخدمين وابدأ بمتابعة تحاليلك الطبية بطريقة سهلة وآمنة.
            </p>
            <button className="bg-accent text-accent-foreground px-10 py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-all shadow-xl">
              سجّل الآن مجاناً
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

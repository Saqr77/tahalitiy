import { UserPlus, FlaskConical, ClipboardCheck, FileCheck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "تسجيل المريض",
    description: "ينشئ المريض حسابه ويربطه بطبيبه",
    num: "١",
  },
  {
    icon: FlaskConical,
    title: "إضافة التحليل",
    description: "المختبر يرفع نتائج التحاليل",
    num: "٢",
  },
  {
    icon: ClipboardCheck,
    title: "مراجعة الطبيب",
    description: "الطبيب يراجع النتائج ويضيف ملاحظاته",
    num: "٣",
  },
  {
    icon: FileCheck,
    title: "عرض النتيجة",
    description: "المريض يستعرض نتائجه وتوصيات طبيبه",
    num: "٤",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-muted/50" id="how-it-works">
      <div className="container">
        <div className="text-center mb-14">
          <span className="text-primary font-semibold text-sm">كيف يعمل؟</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            أربع خطوات بسيطة
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            من التسجيل إلى استلام النتائج بكل سهولة
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 right-[12.5%] left-[12.5%] h-0.5 bg-border" />

          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative z-10 w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg">
                <span className="text-primary-foreground text-2xl font-bold font-cairo">{step.num}</span>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-card border border-border w-full">
                <step.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

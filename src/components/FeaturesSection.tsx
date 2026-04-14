import { FlaskConical, User, Stethoscope, MessageSquareText, Lock, BarChart3 } from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "المختبر",
    description: "إدخال التحاليل ورفع الملفات والنتائج بسهولة تامة",
    color: "bg-medical-blue-light text-medical-blue",
  },
  {
    icon: User,
    title: "المريض",
    description: "استعراض التحاليل وتحميل النتائج في أي وقت",
    color: "bg-medical-green-light text-medical-green",
  },
  {
    icon: Stethoscope,
    title: "الطبيب",
    description: "الاطلاع على السجل الطبي الكامل للمريض",
    color: "bg-medical-purple-light text-medical-purple",
  },
  {
    icon: MessageSquareText,
    title: "ملاحظات طبية",
    description: "إضافة ملاحظات وتوصيات على كل تحليل",
    color: "bg-medical-orange-light text-medical-orange",
  },
  {
    icon: Lock,
    title: "أمان متقدم",
    description: "صلاحيات مخصصة لكل مستخدم وحماية كاملة للبيانات",
    color: "bg-medical-blue-light text-medical-blue",
  },
  {
    icon: BarChart3,
    title: "عرض زمني",
    description: "متابعة تطور التحاليل عبر الزمن برسوم بيانية",
    color: "bg-medical-green-light text-medical-green",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background" id="features">
      <div className="container">
        <div className="text-center mb-14">
          <span className="text-primary font-semibold text-sm tracking-wide">المميزات</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            كل ما تحتاجه في منصة واحدة
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            أدوات متكاملة تسهّل إدارة التحاليل الطبية للجميع
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border hover:border-primary/20 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

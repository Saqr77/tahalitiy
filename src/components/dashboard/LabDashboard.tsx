import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Search, FileText, Calendar, User as UserIcon,
  Upload, X, FlaskConical, CheckCircle2, Clock, Filter,
  CalendarCheck, Eye
} from "lucide-react";

const testTypes = [
  "تحليل دم شامل (CBC)",
  "وظائف الكبد",
  "وظائف الكلى",
  "سكر الدم",
  "الدهون (Lipid Profile)",
  "الغدة الدرقية",
  "فيتامين D",
  "تحليل بول",
  "أخرى",
];

const LabDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"appointments" | "tests">("appointments");

  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [testName, setTestName] = useState("");
  const [testType, setTestType] = useState(testTypes[0]);
  const [resultValue, setResultValue] = useState("");
  const [resultUnit, setResultUnit] = useState("");
  const [normalRange, setNormalRange] = useState("");
  const [notes, setNotes] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState<File | null>(null);

  // Fetch appointments for this lab
  const { data: appointments = [] } = useQuery({
    queryKey: ["lab-appointments"],
    queryFn: () => api.appointments.list(),
  });

  // Fetch patient profiles for appointments
  const appointmentPatientIds = [...new Set(appointments.map((a: any) => a.patient_id))];
  const { data: appointmentPatients = [] } = useQuery({
    queryKey: ["lab-appointment-patients", appointmentPatientIds],
    queryFn: () => api.profiles.getByIds(appointmentPatientIds),
    enabled: appointmentPatientIds.length > 0,
  });

  // Fetch tests
  const { data: tests = [], isLoading } = useQuery({
    queryKey: ["lab-tests"],
    queryFn: () => api.tests.list(),
  });

  // Confirm appointment
  const confirmAppointment = useMutation({
    mutationFn: (id: string) => api.appointments.updateStatus(id, "confirmed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-appointments"] });
      toast({ title: "تم تأكيد الموعد" });
    },
  });

  // Complete appointment
  const completeAppointment = useMutation({
    mutationFn: (id: string) => api.appointments.updateStatus(id, "completed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-appointments"] });
      toast({ title: "تم إكمال الموعد" });
    },
  });

  // Add test mutation
  const addTest = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("غير مسجل الدخول");
      if (!selectedPatientId) throw new Error("اختر المريض");

      const formData = new FormData();
      formData.append("patient_id", selectedPatientId);
      formData.append("test_name", testName);
      formData.append("test_type", testType);
      if (resultValue) formData.append("result_value", resultValue);
      if (resultUnit) formData.append("result_unit", resultUnit);
      if (normalRange) formData.append("normal_range", normalRange);
      if (notes) formData.append("notes", notes);
      formData.append("test_date", testDate);
      if (file) formData.append("file", file);

      await api.tests.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
      toast({ title: "تم إضافة التحليل بنجاح" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setSelectedPatientId("");
    setTestName("");
    setTestType(testTypes[0]);
    setResultValue("");
    setResultUnit("");
    setNormalRange("");
    setNotes("");
    setTestDate(new Date().toISOString().split("T")[0]);
    setFile(null);
  };

  const openFormForPatient = (patientId: string, type: string) => {
    setSelectedPatientId(patientId);
    setTestType(type);
    setShowForm(true);
  };

  const getPatientName = (patientId: string) => {
    const p = appointmentPatients.find(p => p.user_id === patientId);
    return p?.full_name || "مريض";
  };

  const filteredTests = tests.filter((t) => {
    const matchSearch = t.test_name.includes(searchQuery) || t.test_type.includes(searchQuery);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; classes: string; icon: any }> = {
      pending: { label: "قيد الانتظار", classes: "bg-[hsl(var(--medical-orange-light))] text-[hsl(var(--medical-orange))]", icon: Clock },
      confirmed: { label: "مؤكد", classes: "bg-[hsl(var(--medical-blue-light))] text-[hsl(var(--medical-blue))]", icon: CheckCircle2 },
      completed: { label: "مكتمل", classes: "bg-[hsl(var(--medical-green-light))] text-[hsl(var(--medical-green))]", icon: CheckCircle2 },
      reviewed: { label: "تمت المراجعة", classes: "bg-[hsl(var(--medical-blue-light))] text-[hsl(var(--medical-blue))]", icon: FileText },
      cancelled: { label: "ملغي", classes: "bg-destructive/10 text-destructive", icon: X },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.classes}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const pendingAppointments = appointments.filter(a => a.status === "pending" || a.status === "confirmed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة المختبر</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة المواعيد ورفع التحاليل الطبية</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:brightness-110 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          رفع تحليل جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "مواعيد جديدة", value: pendingAppointments.length, icon: CalendarCheck, color: "medical-orange" },
          { label: "إجمالي التحاليل", value: tests.length, icon: FlaskConical, color: "medical-blue" },
          { label: "قيد الانتظار", value: tests.filter(t => t.status === "pending").length, icon: Clock, color: "medical-purple" },
          { label: "مكتملة", value: tests.filter(t => t.status === "completed").length, icon: CheckCircle2, color: "medical-green" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-[hsl(var(--${stat.color}-light))] flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 text-[hsl(var(--${stat.color}))]`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "appointments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            المواعيد
            {pendingAppointments.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingAppointments.length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "tests"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            التحاليل
          </span>
        </button>
      </div>

      {/* Appointments Tab */}
      {activeTab === "appointments" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {appointments.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">لا توجد مواعيد حالياً</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-right text-xs font-semibold text-muted-foreground p-4">المريض</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground p-4">نوع التحليل</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground p-4">التاريخ</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground p-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[hsl(var(--medical-blue-light))] flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-[hsl(var(--medical-blue))]" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{getPatientName(apt.patient_id)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{apt.test_type}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(apt.appointment_date).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-4">{statusBadge(apt.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {apt.status === "pending" && (
                            <button
                              onClick={() => confirmAppointment.mutate(apt.id)}
                              className="text-xs bg-[hsl(var(--medical-blue))] text-white px-3 py-1.5 rounded-lg hover:brightness-110"
                            >
                              تأكيد
                            </button>
                          )}
                          {(apt.status === "confirmed" || apt.status === "pending") && (
                            <>
                              <button
                                onClick={() => completeAppointment.mutate(apt.id)}
                                className="text-xs bg-[hsl(var(--medical-green))] text-white px-3 py-1.5 rounded-lg hover:brightness-110"
                              >
                                إكمال
                              </button>
                              <button
                                onClick={() => openFormForPatient(apt.patient_id, apt.test_type)}
                                className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:brightness-110"
                              >
                                رفع تحليل
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tests Tab */}
      {activeTab === "tests" && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث عن تحليل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {["all", "pending", "completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s === "all" ? "الكل" : s === "pending" ? "قيد الانتظار" : "مكتمل"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">جاري تحميل التحاليل...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="p-12 text-center">
                <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">لا توجد تحاليل بعد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-right text-xs font-semibold text-muted-foreground p-4">اسم التحليل</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground p-4">النوع</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground p-4">المريض</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground p-4">النتيجة</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground p-4">التاريخ</th>
                      <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTests.map((test) => (
                      <tr key={test.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium text-foreground text-sm">{test.test_name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{test.test_type}</td>
                        <td className="p-4 text-sm text-muted-foreground">{getPatientName(test.patient_id)}</td>
                        <td className="p-4 text-sm text-foreground">
                          {test.result_value ? <span>{test.result_value} {test.result_unit}</span> : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{new Date(test.test_date).toLocaleDateString("ar-SA")}</td>
                        <td className="p-4">{statusBadge(test.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add test modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">رفع تحليل جديد</h2>
              <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTest.mutate();
              }}
              className="p-6 space-y-4"
            >
              {/* Patient selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">المريض</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="">-- اختر المريض --</option>
                  {appointmentPatients.map((p) => (
                    <option key={p.user_id} value={p.user_id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              {/* Test name & type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">اسم التحليل</label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="مثال: Hemoglobin"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">نوع التحليل</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  >
                    {testTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result & Unit & Range */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">النتيجة</label>
                  <input type="text" value={resultValue} onChange={(e) => setResultValue(e.target.value)} placeholder="14.5"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">الوحدة</label>
                  <input type="text" value={resultUnit} onChange={(e) => setResultUnit(e.target.value)} placeholder="g/dL"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">المعدل الطبيعي</label>
                  <input type="text" value={normalRange} onChange={(e) => setNormalRange(e.target.value)} placeholder="12-17"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" dir="ltr" />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">تاريخ التحليل</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">ملاحظات</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات إضافية..." rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none" />
              </div>

              {/* File upload */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">ملف التحليل (اختياري)</label>
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-input hover:border-primary/50 cursor-pointer transition-colors bg-muted/30">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {file ? file.name : "اختر ملف PDF أو صورة"}
                  </span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <button
                type="submit"
                disabled={addTest.isPending}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 shadow-md"
              >
                {addTest.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    جاري الحفظ...
                  </span>
                ) : "حفظ التحليل"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabDashboard;

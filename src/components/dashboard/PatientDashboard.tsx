import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  CalendarPlus, FlaskConical, Clock, CheckCircle2, FileText,
  X, Calendar, MessageSquare, Download, ChevronDown, ChevronUp
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

const PatientDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showBooking, setShowBooking] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  // Booking form state
  const [labId, setLabId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [testType, setTestType] = useState(testTypes[0]);
  const [bookingNotes, setBookingNotes] = useState("");

  // Fetch available labs
  const { data: labs = [] } = useQuery({
    queryKey: ["available-labs"],
    queryFn: () => api.profiles.getLabs(),
  });

  // Fetch patient appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ["patient-appointments"],
    queryFn: () => api.appointments.list(),
  });

  // Fetch patient tests
  const { data: tests = [] } = useQuery({
    queryKey: ["patient-tests"],
    queryFn: () => api.tests.list(),
  });

  // Fetch doctor notes for patient's tests
  const { data: notes = [] } = useQuery({
    queryKey: ["patient-test-notes"],
    queryFn: () => api.notes.list(tests.map((t: any) => t.id)),
    enabled: tests.length > 0,
  });

  // Book appointment
  const bookAppointment = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("غير مسجل الدخول");
      await api.appointments.create({
        lab_id: labId,
        appointment_date: appointmentDate,
        test_type: testType,
        notes: bookingNotes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      toast({ title: "تم حجز الموعد بنجاح" });
      resetBooking();
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetBooking = () => {
    setShowBooking(false);
    setLabId("");
    setAppointmentDate("");
    setTestType(testTypes[0]);
    setBookingNotes("");
  };

  const cancelAppointment = useMutation({
    mutationFn: async (id: string) => {
      await api.appointments.updateStatus(id, "cancelled");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      toast({ title: "تم إلغاء الموعد" });
    },
  });

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; classes: string; icon: any }> = {
      pending: { label: "قيد الانتظار", classes: "bg-[hsl(var(--medical-orange-light))] text-[hsl(var(--medical-orange))]", icon: Clock },
      confirmed: { label: "مؤكد", classes: "bg-[hsl(var(--medical-blue-light))] text-[hsl(var(--medical-blue))]", icon: CheckCircle2 },
      completed: { label: "مكتمل", classes: "bg-[hsl(var(--medical-green-light))] text-[hsl(var(--medical-green))]", icon: CheckCircle2 },
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

  const getNotesForTest = (testId: string) => notes.filter(n => n.test_id === testId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة المريض</h1>
          <p className="text-muted-foreground text-sm mt-1">حجز المواعيد ومتابعة التحاليل</p>
        </div>
        <button
          onClick={() => setShowBooking(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm hover:brightness-110 transition-all shadow-md"
        >
          <CalendarPlus className="w-4 h-4" />
          حجز موعد جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "المواعيد", value: appointments.length, icon: Calendar, color: "medical-blue" },
          { label: "قيد الانتظار", value: appointments.filter(a => a.status === "pending").length, icon: Clock, color: "medical-orange" },
          { label: "التحاليل", value: tests.length, icon: FlaskConical, color: "medical-green" },
          { label: "ملاحظات الطبيب", value: notes.length, icon: MessageSquare, color: "medical-purple" },
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

      {/* Appointments */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            المواعيد
          </h2>
        </div>
        {appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">لا توجد مواعيد بعد</p>
            <p className="text-muted-foreground/70 text-sm mt-1">احجز موعدك الأول</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">نوع التحليل</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">التاريخ</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">الحالة</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-4">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm font-medium text-foreground">{apt.test_type}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(apt.appointment_date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-4">{statusBadge(apt.status)}</td>
                    <td className="p-4">
                      {apt.status === "pending" && (
                        <button
                          onClick={() => cancelAppointment.mutate(apt.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          إلغاء
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[hsl(var(--medical-green))]" />
            نتائج التحاليل
          </h2>
        </div>
        {tests.length === 0 ? (
          <div className="p-12 text-center">
            <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">لا توجد نتائج بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tests.map((test) => {
              const testNotes = getNotesForTest(test.id);
              const isExpanded = expandedTest === test.id;
              return (
                <div key={test.id}>
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[hsl(var(--medical-green-light))] flex items-center justify-center">
                        <FlaskConical className="w-5 h-5 text-[hsl(var(--medical-green))]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{test.test_name}</p>
                        <p className="text-xs text-muted-foreground">{test.test_type} • {new Date(test.test_date).toLocaleDateString("ar-SA")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {test.result_value && (
                        <span className="text-sm font-semibold text-foreground">{test.result_value} {test.result_unit}</span>
                      )}
                      {testNotes.length > 0 && (
                        <span className="bg-[hsl(var(--medical-purple-light))] text-[hsl(var(--medical-purple))] text-xs px-2 py-0.5 rounded-full">
                          {testNotes.length} ملاحظة
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 bg-muted/20">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div><span className="text-muted-foreground">النتيجة:</span> <span className="font-medium text-foreground">{test.result_value || "—"} {test.result_unit}</span></div>
                        <div><span className="text-muted-foreground">المعدل الطبيعي:</span> <span className="font-medium text-foreground">{test.normal_range || "—"}</span></div>
                        <div><span className="text-muted-foreground">الحالة:</span> {statusBadge(test.status)}</div>
                        {test.file_url && (
                          <div>
                            <a href={`http://localhost:3001${test.file_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                              <Download className="w-3.5 h-3.5" />
                              تحميل الملف
                            </a>
                          </div>
                        )}
                      </div>
                      {test.notes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">ملاحظات المختبر:</span>
                          <p className="text-foreground mt-1">{test.notes}</p>
                        </div>
                      )}
                      {testNotes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-[hsl(var(--medical-purple))]" />
                            ملاحظات الطبيب
                          </h4>
                          {testNotes.map((note) => (
                            <div key={note.id} className="bg-card rounded-lg p-3 border border-border">
                              <p className="text-sm text-foreground">{note.note}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(note.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">حجز موعد جديد</h2>
              <button onClick={resetBooking} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                bookAppointment.mutate();
              }}
              className="p-6 space-y-4"
            >
              {/* Lab selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">اختر المختبر</label>
                <select
                  required
                  value={labId}
                  onChange={(e) => setLabId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="">-- اختر مختبر --</option>
                  {labs.map((lab) => (
                    <option key={lab.user_id} value={lab.user_id}>{lab.full_name}</option>
                  ))}
                </select>
              </div>

              {/* Test type */}
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

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">تاريخ ووقت الموعد</label>
                <input
                  type="datetime-local"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">ملاحظات (اختياري)</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={bookAppointment.isPending}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 shadow-md"
              >
                {bookAppointment.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    جاري الحجز...
                  </span>
                ) : "تأكيد الحجز"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

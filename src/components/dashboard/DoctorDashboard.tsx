import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  FlaskConical, Search, Clock, CheckCircle2, FileText,
  MessageSquare, Send, User as UserIcon, ChevronDown, ChevronUp
} from "lucide-react";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [activeNoteTest, setActiveNoteTest] = useState<string | null>(null);

  // Fetch all tests (doctors can see all)
  const { data: tests = [], isLoading } = useQuery({
    queryKey: ["doctor-tests"],
    queryFn: () => api.tests.list(),
  });

  // Fetch all patient profiles
  const patientIds = [...new Set(tests.map((t: any) => t.patient_id))] as string[];
  const { data: patients = [] } = useQuery({
    queryKey: ["doctor-patients", patientIds],
    queryFn: () => api.profiles.getByIds(patientIds),
    enabled: patientIds.length > 0,
  });

  // Fetch all notes
  const { data: notes = [] } = useQuery({
    queryKey: ["doctor-notes"],
    queryFn: () => api.notes.list(),
  });

  // Add note mutation
  const addNote = useMutation({
    mutationFn: async (testId: string) => {
      if (!user) throw new Error("غير مسجل الدخول");
      await api.notes.create(testId, noteText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-notes"] });
      toast({ title: "تمت إضافة الملاحظة بنجاح" });
      setNoteText("");
      setActiveNoteTest(null);
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const getPatientName = (patientId: string) => {
    const p = patients.find(p => p.user_id === patientId);
    return p?.full_name || "مريض غير معروف";
  };

  const getNotesForTest = (testId: string) => notes.filter(n => n.test_id === testId);

  const filteredTests = tests.filter(t =>
    t.test_name.includes(searchQuery) ||
    t.test_type.includes(searchQuery) ||
    getPatientName(t.patient_id).includes(searchQuery)
  );

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; classes: string; icon: any }> = {
      pending: { label: "قيد الانتظار", classes: "bg-[hsl(var(--medical-orange-light))] text-[hsl(var(--medical-orange))]", icon: Clock },
      completed: { label: "مكتمل", classes: "bg-[hsl(var(--medical-green-light))] text-[hsl(var(--medical-green))]", icon: CheckCircle2 },
      reviewed: { label: "تمت المراجعة", classes: "bg-[hsl(var(--medical-blue-light))] text-[hsl(var(--medical-blue))]", icon: FileText },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">لوحة الطبيب</h1>
        <p className="text-muted-foreground text-sm mt-1">مراجعة تحاليل المرضى وإضافة الملاحظات الطبية</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي التحاليل", value: tests.length, icon: FlaskConical, color: "medical-blue" },
          { label: "المرضى", value: patientIds.length, icon: UserIcon, color: "medical-green" },
          { label: "ملاحظاتي", value: notes.filter(n => n.doctor_id === user?.id).length, icon: MessageSquare, color: "medical-purple" },
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث باسم المريض أو التحليل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        />
      </div>

      {/* Tests list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            سجل التحاليل
          </h2>
        </div>
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">جاري التحميل...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="p-12 text-center">
            <FlaskConical className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">لا توجد تحاليل</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTests.map((test) => {
              const testNotes = getNotesForTest(test.id);
              const isExpanded = expandedTest === test.id;
              return (
                <div key={test.id}>
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedTest(isExpanded ? null : test.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[hsl(var(--medical-blue-light))] flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-[hsl(var(--medical-blue))]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{getPatientName(test.patient_id)}</p>
                        <p className="text-xs text-muted-foreground">{test.test_name} • {test.test_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge(test.status)}
                      <span className="text-xs text-muted-foreground">{new Date(test.test_date).toLocaleDateString("ar-SA")}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 bg-muted/20">
                      {/* Test details */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div><span className="text-muted-foreground">النتيجة:</span> <span className="font-medium text-foreground">{test.result_value || "—"} {test.result_unit}</span></div>
                        <div><span className="text-muted-foreground">المعدل الطبيعي:</span> <span className="font-medium text-foreground">{test.normal_range || "—"}</span></div>
                        <div><span className="text-muted-foreground">تاريخ:</span> <span className="font-medium text-foreground">{new Date(test.test_date).toLocaleDateString("ar-SA")}</span></div>
                      </div>
                      {test.notes && (
                        <div className="text-sm"><span className="text-muted-foreground">ملاحظات المختبر:</span> <p className="text-foreground mt-1">{test.notes}</p></div>
                      )}

                      {/* Existing notes */}
                      {testNotes.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-foreground">الملاحظات السابقة</h4>
                          {testNotes.map((note) => (
                            <div key={note.id} className="bg-card rounded-lg p-3 border border-border">
                              <p className="text-sm text-foreground">{note.note}</p>
                              <p className="text-xs text-muted-foreground mt-1">{new Date(note.created_at).toLocaleDateString("ar-SA")}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add note */}
                      {activeNoteTest === test.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="اكتب ملاحظتك الطبية هنا..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => addNote.mutate(test.id)}
                              disabled={!noteText.trim() || addNote.isPending}
                              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              إرسال
                            </button>
                            <button
                              onClick={() => { setActiveNoteTest(null); setNoteText(""); }}
                              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveNoteTest(test.id)}
                          className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
                        >
                          <MessageSquare className="w-4 h-4" />
                          إضافة ملاحظة طبية
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

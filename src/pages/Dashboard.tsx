import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LabDashboard from "@/components/dashboard/LabDashboard";
import PatientDashboard from "@/components/dashboard/PatientDashboard";
import DoctorDashboard from "@/components/dashboard/DoctorDashboard";
import { FlaskConical, LogOut, User } from "lucide-react";

const Dashboard = () => {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-cairo">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const roleLabels: Record<string, string> = {
    patient: "مريض",
    doctor: "طبيب",
    lab: "مختبر",
  };

  return (
    <div className="min-h-screen bg-background font-cairo">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">تحاليلي</span>
              {role && (
                <span className="mr-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {roleLabels[role]}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user.email || ""}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors px-3 py-2 rounded-lg hover:bg-destructive/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {role === "lab" && <LabDashboard />}
        {role === "patient" && <PatientDashboard />}
        {role === "doctor" && <DoctorDashboard />}
        {!role && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-foreground mb-2">مرحباً بك</h2>
            <p className="text-muted-foreground">لم يتم تعيين دور لحسابك بعد</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, FlaskConical } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground font-cairo">تحاليلي</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">المميزات</a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">كيف يعمل</a>
          <button onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-semibold text-sm hover:brightness-110 transition-all">
            تسجيل الدخول
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          <a href="#features" className="block text-muted-foreground hover:text-foreground py-2 text-sm" onClick={() => setOpen(false)}>المميزات</a>
          <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground py-2 text-sm" onClick={() => setOpen(false)}>كيف يعمل</a>
          <button onClick={() => { navigate("/auth"); setOpen(false); }} className="w-full bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm">
            تسجيل الدخول
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

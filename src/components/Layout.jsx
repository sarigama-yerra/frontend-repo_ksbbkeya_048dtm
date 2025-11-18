import { Globe2, Search, Menu } from "lucide-react";
import { useState } from "react";

export default function Layout({ children, onLangChange, lang }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-900/70 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-slate-800" onClick={() => setOpen(!open)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-bold tracking-tight text-lg">Auto DMS</div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800">
              <Search className="w-4 h-4 opacity-70" />
              <input placeholder={lang==='ar'? 'بحث سريع' : 'Quick search'} className="bg-transparent outline-none text-sm w-56" />
            </div>
            <button onClick={onLangChange} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800">
              <Globe2 className="w-4 h-4" />
              <span className="text-sm">{lang === 'ar' ? 'العربية' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-4">
        {open && (
          <aside className="col-span-12 md:col-span-3 lg:col-span-2 space-y-2">
            <NavButton label={lang==='ar'? 'الخدمة' : 'Service'} />
            <NavButton label={lang==='ar'? 'القطع' : 'Parts'} />
            <NavButton label={lang==='ar'? 'المبيعات' : 'Sales'} />
            <NavButton label={lang==='ar'? 'الحسابات' : 'Accounting'} />
            <NavButton label={lang==='ar'? 'المستخدمون' : 'Users'} />
            <NavButton label={lang==='ar'? 'التقارير' : 'Reports'} />
          </aside>
        )}
        <main className={`col-span-12 ${open? 'md:col-span-9 lg:col-span-10' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

function NavButton({ label }){
  return (
    <button className="w-full text-left px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800 transition">{label}</button>
  )
}

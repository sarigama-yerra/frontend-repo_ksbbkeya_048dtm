import { useEffect, useState } from "react";

const t = (lang) => ({
  title: lang==='ar'? 'نظام إدارة الوكالة' : 'Dealership Management System',
  subtitle: lang==='ar'? 'شاشات سريعة وبسيطة للإدخال والبحث' : 'Fast, focused screens for simple input and search',
  boxes: [
    { k: 'service', ar: 'الخدمة', en: 'Service'},
    { k: 'parts', ar: 'القطع', en: 'Parts'},
    { k: 'sales', ar: 'المبيعات', en: 'Sales'},
    { k: 'accounting', ar: 'الحسابات', en: 'Accounting'},
    { k: 'reports', ar: 'التقارير', en: 'Reports'},
  ]
});

export default function Dashboard({ lang }){
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    const base = import.meta.env.VITE_BACKEND_URL || "";
    fetch(`${base}/api/reports/summary`).then(r=>r.json()).then(setSummary).catch(()=>{});
  },[]);
  const dict = t(lang);
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{dict.title}</h1>
      <p className="text-slate-400 mb-6">{dict.subtitle}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dict.boxes.map((b) => (
          <div key={b.k} className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-sm text-slate-400">{b.en} / {b.ar}</div>
            <div className="text-3xl font-bold mt-2">{summary?.[b.k] ?? '--'}</div>
          </div>
        ))}
      </div>
      {summary && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(summary).map(([k,v]) => (
            <div key={k} className="rounded-lg bg-slate-900 border border-slate-800 p-3">
              <div className="text-xs text-slate-400">{k}</div>
              <div className="text-xl font-semibold">{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from "react";
import { Receipt, CreditCard, CheckCircle2 } from "lucide-react";

const t = (lang) => ({
  title: lang==='ar'? 'طابور الكاشير' : 'Cashier Queue',
  pending: lang==='ar'? 'فواتير قيد الدفع' : 'Pending invoices',
  pay: lang==='ar'? 'دفع' : 'Pay',
  method: lang==='ar'? 'طريقة الدفع' : 'Method',
  paid: lang==='ar'? 'تم الدفع' : 'Paid',
});

export default function CashierQueue({ lang }){
  const dict = useMemo(()=>t(lang),[lang]);
  const base = import.meta.env.VITE_BACKEND_URL || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [methodById, setMethodById] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${base}/api/invoices?status=pending`);
      const arr = await r.json();
      setItems(arr);
    } catch(e){}
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const pay = async (id) => {
    const method = methodById[id] || 'cash';
    const r = await fetch(`${base}/api/invoices/${id}/pay`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ method }) });
    if(r.ok){
      await load();
      alert(dict.paid);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Receipt className="w-5 h-5"/> {dict.title}</h2>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-sm text-slate-400 mb-3">{dict.pending}</div>
        <div className="space-y-2">
          {loading && <div className="text-slate-500 text-sm">...</div>}
          {!loading && items.length===0 && <div className="text-slate-500 text-sm">--</div>}
          {items.map(inv => (
            <div key={inv.id} className="grid grid-cols-12 gap-2 items-center bg-slate-950/40 rounded-lg p-2 border border-slate-800">
              <div className="col-span-4 text-sm">{inv.source} · {inv.source_id || ''}</div>
              <div className="col-span-3 text-sm">{(inv.total||0).toFixed(2)} (VAT {(inv.vat||0).toFixed(2)})</div>
              <select className="col-span-3 px-2 py-1 rounded bg-slate-800" value={methodById[inv.id] || 'cash'} onChange={(e)=> setMethodById(prev=>({...prev, [inv.id]: e.target.value}))}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
              </select>
              <button onClick={()=>pay(inv.id)} className="col-span-2 justify-self-end px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1"><CreditCard className="w-4 h-4"/> {dict.pay}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

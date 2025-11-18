import { useEffect, useMemo, useState } from "react";
import { Receipt, CreditCard, PlusCircle, MinusCircle, BadgePercent } from "lucide-react";

const t = (lang) => ({
  title: lang==='ar'? 'طابور الكاشير' : 'Cashier Queue',
  pending: lang==='ar'? 'فواتير قيد الدفع' : 'Pending invoices',
  pay: lang==='ar'? 'دفع' : 'Pay',
  paid: lang==='ar'? 'تم الدفع' : 'Paid',
  split: lang==='ar'? 'تقسيم الدفعة' : 'Split Payment',
  addRow: lang==='ar'? 'إضافة سطر دفع' : 'Add row',
  amount: lang==='ar'? 'المبلغ' : 'Amount',
  reference: lang==='ar'? 'مرجع' : 'Reference',
  total: lang==='ar'? 'الإجمالي' : 'Total',
  vat: lang==='ar'? 'ضريبة' : 'VAT',
  remaining: lang==='ar'? 'المتبقي' : 'Remaining',
  validateRef: lang==='ar'? 'يتطلب مرجع' : 'Reference required',
  invalidAmt: lang==='ar'? 'المبلغ غير صالح' : 'Invalid amount',
});

const METHODS = [
  { value: 'cash', labelEn: 'Cash', labelAr: 'نقد' },
  { value: 'card', labelEn: 'Card (POS)', labelAr: 'بطاقة' },
  { value: 'bank_transfer', labelEn: 'Bank Transfer', labelAr: 'حوالة بنكية' },
  { value: 'cheque', labelEn: 'Cheque', labelAr: 'شيك' },
  { value: 'account', labelEn: 'On Account', labelAr: 'حساب/آجل' },
  { value: 'voucher', labelEn: 'Voucher', labelAr: 'قسيمة' },
  { value: 'mobile_wallet', labelEn: 'Mobile Wallet', labelAr: 'محفظة' },
];

export default function CashierQueue({ lang }){
  const dict = useMemo(()=>t(lang),[lang]);
  const base = import.meta.env.VITE_BACKEND_URL || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [splitOpen, setSplitOpen] = useState({});
  const [rowsByInv, setRowsByInv] = useState({});

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

  const ensureRows = (inv) => {
    setRowsByInv(prev => {
      if(prev[inv.id]) return prev;
      return { ...prev, [inv.id]: [{ method:'cash', amount: inv.total||0, reference:'' }] };
    });
  };

  const addRow = (inv) => {
    setRowsByInv(prev => {
      const rows = prev[inv.id] || [];
      return { ...prev, [inv.id]: [...rows, { method:'cash', amount: 0, reference:'' }] };
    });
  };

  const removeRow = (inv, idx) => {
    setRowsByInv(prev => {
      const rows = prev[inv.id] || [];
      return { ...prev, [inv.id]: rows.filter((_,i)=>i!==idx) };
    });
  };

  const updateRow = (inv, idx, key, value) => {
    setRowsByInv(prev => {
      const rows = prev[inv.id] ? [...prev[inv.id]] : [];
      rows[idx] = { ...rows[idx], [key]: value };
      return { ...prev, [inv.id]: rows };
    });
  };

  const sumRows = (inv) => (rowsByInv[inv.id]||[]).reduce((s,r)=> s + (parseFloat(r.amount)||0), 0);

  const pay = async (inv) => {
    const rows = rowsByInv[inv.id] || [];
    if(rows.length===0){
      ensureRows(inv);
      return;
    }
    // validations
    for(const r of rows){
      if(!(r.amount>0)) { alert(dict.invalidAmt); return; }
      if(["bank_transfer","cheque","account"].includes(r.method) && !r.reference){ alert(dict.validateRef); return; }
    }
    const payload = { payments: rows.map(r=> ({ method: r.method, amount: parseFloat(r.amount||0), reference: r.reference||undefined })) };
    const res = await fetch(`${base}/api/invoices/${inv.id}/pay`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(res.ok){
      await load();
      alert(dict.paid);
    } else {
      const err = await res.json().catch(()=>({detail:'error'}));
      alert(err.detail || 'Error');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><Receipt className="w-5 h-5"/> {dict.title}</h2>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="text-sm text-slate-400 mb-3">{dict.pending}</div>
        <div className="space-y-3">
          {loading && <div className="text-slate-500 text-sm">...</div>}
          {!loading && items.length===0 && <div className="text-slate-500 text-sm">--</div>}
          {items.map(inv => {
            const rows = rowsByInv[inv.id] || [];
            const remain = Math.max(0, Math.round(((inv.total||0) - sumRows(inv)) * 100)/100);
            return (
              <div key={inv.id} className="rounded-lg border border-slate-800 bg-slate-950/40">
                <div className="grid grid-cols-12 gap-2 items-center p-2">
                  <div className="col-span-4 text-sm">{inv.source} · {inv.source_id || ''}</div>
                  <div className="col-span-4 text-sm flex items-center gap-3">
                    <span>{dict.total}: {(inv.total||0).toFixed(2)}</span>
                    <span className="text-slate-400">{dict.vat}: {(inv.vat||0).toFixed(2)}</span>
                  </div>
                  <div className="col-span-4 flex justify-end gap-2">
                    <button onClick={()=>{ ensureRows(inv); setSplitOpen(o=>({...o, [inv.id]: !o[inv.id]})); }} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 flex items-center gap-1"><BadgePercent className="w-4 h-4"/> {dict.split}</button>
                    <button onClick={()=>pay(inv)} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1"><CreditCard className="w-4 h-4"/> {dict.pay}</button>
                  </div>
                </div>
                {splitOpen[inv.id] && (
                  <div className="p-2 border-t border-slate-800">
                    <div className="space-y-2">
                      {rows.map((row, idx)=> (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <select className="col-span-4 px-2 py-1 rounded bg-slate-800" value={row.method} onChange={(e)=>updateRow(inv, idx, 'method', e.target.value)}>
                            {METHODS.map(m=> (
                              <option key={m.value} value={m.value}>{lang==='ar'? m.labelAr : m.labelEn}</option>
                            ))}
                          </select>
                          <input type="number" className="col-span-3 px-2 py-1 rounded bg-slate-800" placeholder={dict.amount} value={row.amount} onChange={(e)=>updateRow(inv, idx, 'amount', e.target.value)} />
                          <input className="col-span-4 px-2 py-1 rounded bg-slate-800" placeholder={dict.reference} value={row.reference||''} onChange={(e)=>updateRow(inv, idx, 'reference', e.target.value)} />
                          <button onClick={()=>removeRow(inv, idx)} className="col-span-1 justify-self-end px-2 py-1 rounded bg-red-600 hover:bg-red-500"><MinusCircle className="w-4 h-4"/></button>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-sm text-slate-300">{dict.remaining}: <span className={`font-semibold ${remain>0? 'text-amber-300':'text-emerald-300'}`}>{remain.toFixed(2)}</span></div>
                        <button onClick={()=>addRow(inv)} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 flex items-center gap-1"><PlusCircle className="w-4 h-4"/> {dict.addRow}</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

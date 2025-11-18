import { useMemo, useState } from "react";
import { ShoppingCart, Barcode, PlusCircle, Trash2, Receipt } from "lucide-react";

const t = (lang) => ({
  title: lang==='ar'? 'نقطة بيع القطع' : 'Parts Counter POS',
  scan: lang==='ar'? 'أدخل/امسح الباركود' : 'Enter/Scan barcode',
  qty: lang==='ar'? 'الكمية' : 'Qty',
  price: lang==='ar'? 'السعر' : 'Price',
  subtotal: lang==='ar'? 'المجموع' : 'Subtotal',
  vat: lang==='ar'? 'ضريبة' : 'VAT',
  total: lang==='ar'? 'الإجمالي' : 'Total',
  preinvoice: lang==='ar'? 'إصدار فاتورة مبدئية' : 'Create Pre-Invoice',
});

export default function PartsPOS({ lang }){
  const dict = useMemo(()=>t(lang),[lang]);
  const base = import.meta.env.VITE_BACKEND_URL || "";
  const [sku, setSku] = useState("");
  const [cart, setCart] = useState([]);

  const addBySku = async () => {
    if(!sku) return;
    const r = await fetch(`${base}/api/parts?sku=${encodeURIComponent(sku)}`);
    const arr = await r.json();
    const p = arr[0];
    if(p){
      const existing = cart.findIndex(i=>i.part_id===p.id);
      if(existing>-1){
        const cp = [...cart]; cp[existing].quantity += 1; setCart(cp);
      } else {
        setCart([...cart, { part_id: p.id, description: p.name, quantity:1, unit_price: p.price||0, discount:0, item_type:'part' }]);
      }
      setSku("");
    } else {
      alert(lang==='ar'? 'القطعة غير موجودة' : 'Part not found');
    }
  };

  const removeIdx = (i) => setCart(cart.filter((_,idx)=>idx!==i));

  const totals = useMemo(()=>{
    const subtotal = cart.reduce((s,i)=> s + (i.unit_price * i.quantity - (i.discount||0)), 0);
    const vat = Math.round(subtotal * 0.15 * 100)/100;
    const total = Math.round((subtotal + vat) * 100)/100;
    return { subtotal, vat, total };
  },[cart]);

  const createPreInvoice = async () => {
    if(cart.length===0) return;
    const payload = { source: 'parts', customer_id: 'walkin', items: cart, vat_rate: 0.15 };
    const r = await fetch(`${base}/api/invoices`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(r.ok){
      alert(lang==='ar'? 'تم إنشاء فاتورة مبدئية' : 'Pre-invoice created');
      setCart([]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> {dict.title}</h2>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="flex gap-2">
          <input value={sku} onChange={e=>setSku(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && addBySku()} placeholder={dict.scan} className="flex-1 px-3 py-2 rounded-lg bg-slate-800"/>
          <button onClick={addBySku} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"><Barcode className="w-4 h-4"/></button>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2">
        {cart.length===0 && <div className="text-slate-500 text-sm">--</div>}
        {cart.map((it, idx)=> (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5">{it.description}</div>
            <input type="number" className="col-span-2 px-2 py-1 rounded bg-slate-800" value={it.quantity} onChange={e=>{
              const cp=[...cart]; cp[idx].quantity=parseInt(e.target.value||'0',10); setCart(cp);
            }}/>
            <input type="number" className="col-span-2 px-2 py-1 rounded bg-slate-800" value={it.unit_price} onChange={e=>{
              const cp=[...cart]; cp[idx].unit_price=parseFloat(e.target.value||'0'); setCart(cp);
            }}/>
            <div className="col-span-2 text-right">{(it.unit_price*it.quantity).toFixed(2)}</div>
            <button onClick={()=>removeIdx(idx)} className="col-span-1 justify-self-end px-2 py-1 rounded bg-red-600 hover:bg-red-500"><Trash2 className="w-4 h-4"/></button>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 flex flex-wrap gap-6 items-center justify-between">
        <div className="text-sm">{dict.subtotal}: <span className="font-semibold">{totals.subtotal.toFixed(2)}</span> · {dict.vat}: <span className="font-semibold">{totals.vat.toFixed(2)}</span> · {dict.total}: <span className="font-semibold">{totals.total.toFixed(2)}</span></div>
        <button onClick={createPreInvoice} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2"><Receipt className="w-4 h-4"/> {dict.preinvoice}</button>
      </div>
    </div>
  );
}

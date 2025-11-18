import { Camera, Barcode, PlusCircle, Car, Wrench } from "lucide-react";
import { useState } from "react";

export default function QuickActions({ lang }){
  const [vin, setVin] = useState("");
  const [sku, setSku] = useState("");

  const base = import.meta.env.VITE_BACKEND_URL || "";
  const addVehicle = async () => {
    if(!vin) return;
    await fetch(`${base}/api/vehicles`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ vin })});
    setVin("");
    alert(lang==='ar'? 'تم تسجيل المركبة' : 'Vehicle registered');
  };
  const addPart = async () => {
    if(!sku) return;
    await fetch(`${base}/api/parts`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sku, name: sku, price:0, cost:0, stock:0 })});
    setSku("");
    alert(lang==='ar'? 'تم تسجيل القطعة' : 'Part registered');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm"><Car className="w-4 h-4"/> {lang==='ar'? 'تسجيل مركبة (VIN)' : 'Register Vehicle (VIN)'} </div>
        <div className="mt-3 flex gap-2">
          <input value={vin} onChange={e=>setVin(e.target.value)} placeholder={lang==='ar'? 'أدخل أو امسح VIN' : 'Enter or scan VIN'} className="flex-1 px-3 py-2 rounded-lg bg-slate-800 outline-none" />
          <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={addVehicle}><PlusCircle className="w-5 h-5"/></button>
        </div>
        <div className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Camera className="w-3 h-3"/> {lang==='ar'? 'يدعم الكاميرا والماسح' : 'Camera/scanner friendly'}</div>
      </div>
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm"><Wrench className="w-4 h-4"/> {lang==='ar'? 'تسجيل قطعة (باركود)' : 'Register Part (Barcode)'} </div>
        <div className="mt-3 flex gap-2">
          <input value={sku} onChange={e=>setSku(e.target.value)} placeholder={lang==='ar'? 'أدخل أو امسح الباركود' : 'Enter or scan barcode'} className="flex-1 px-3 py-2 rounded-lg bg-slate-800 outline-none" />
          <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500" onClick={addPart}><PlusCircle className="w-5 h-5"/></button>
        </div>
        <div className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Barcode className="w-3 h-3"/> {lang==='ar'? 'يدعم الباركود' : 'Barcode ready'}</div>
      </div>
    </div>
  )
}

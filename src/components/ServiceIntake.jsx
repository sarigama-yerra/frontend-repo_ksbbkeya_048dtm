import { useEffect, useMemo, useState } from "react";
import { Car, UserPlus, User, Search, PlusCircle, Wrench, ClipboardList, CheckSquare, Users } from "lucide-react";

const t = (lang) => ({
  title: lang==='ar'? 'استقبال الخدمة وإنشاء أمر عمل' : 'Service Intake & Job Card',
  vin: lang==='ar'? 'VIN' : 'VIN',
  scanVin: lang==='ar'? 'إدخال/مسح VIN' : 'Enter/Scan VIN',
  customerPhone: lang==='ar'? 'هاتف العميل' : 'Customer Phone',
  customerName: lang==='ar'? 'اسم العميل' : 'Customer Name',
  createCustomer: lang==='ar'? 'إضافة عميل' : 'Add Customer',
  vehicleFound: lang==='ar'? 'تم العثور على المركبة' : 'Vehicle found',
  registerVehicle: lang==='ar'? 'تسجيل مركبة' : 'Register Vehicle',
  notes: lang==='ar'? 'ملاحظات الفحص' : 'Check Notes',
  complaint: lang==='ar'? 'شكوى العميل' : 'Customer Complaint',
  addLabor: lang==='ar'? 'إضافة عمل' : 'Add Labor',
  addPart: lang==='ar'? 'إضافة قطعة' : 'Add Part',
  addMaterial: lang==='ar'? 'إضافة مادة' : 'Add Material',
  addOutside: lang==='ar'? 'إضافة عمل خارجي' : 'Add Outside Work',
  assignTech: lang==='ar'? 'تعيين فنيين' : 'Assign Technicians',
  createJob: lang==='ar'? 'إنشاء أمر عمل' : 'Create Job Card',
  search: lang==='ar'? 'بحث' : 'Search',
  price: lang==='ar'? 'السعر' : 'Price',
  qty: lang==='ar'? 'الكمية' : 'Qty',
  rate: lang==='ar'? 'الأجرة' : 'Rate',
  hours: lang==='ar'? 'الساعات' : 'Hours',
  discount: lang==='ar'? 'خصم' : 'Discount',
  technician: lang==='ar'? 'الفنيون' : 'Technicians',
  success: lang==='ar'? 'تم إنشاء أمر العمل' : 'Job card created',
});

export default function ServiceIntake({ lang }){
  const dict = useMemo(()=>t(lang),[lang]);
  const base = import.meta.env.VITE_BACKEND_URL || "";

  const [vin, setVin] = useState("");
  const [vehicle, setVehicle] = useState(null);

  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState(null);
  const [customerName, setCustomerName] = useState("");

  const [labor, setLabor] = useState([]);
  const [parts, setParts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [outside, setOutside] = useState([]);
  const [checkNotes, setCheckNotes] = useState("");
  const [complaint, setComplaint] = useState("");
  const [techs, setTechs] = useState([]);
  const [availableTechs, setAvailableTechs] = useState([]);

  useEffect(()=>{
    fetch(`${base}/api/technicians?only_available=true`).then(r=>r.json()).then(setAvailableTechs).catch(()=>{});
  },[base]);

  const searchVehicle = async () => {
    const r = await fetch(`${base}/api/vehicles?q=${encodeURIComponent(vin)}`);
    const arr = await r.json();
    setVehicle(arr[0] || null);
  };

  const registerVehicle = async () => {
    if(!vin) return;
    const res = await fetch(`${base}/api/vehicles`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ vin })});
    if(res.ok){
      await searchVehicle();
    }
  };

  const searchCustomer = async () => {
    const r = await fetch(`${base}/api/customers?q=${encodeURIComponent(phone)}`);
    const arr = await r.json();
    setCustomer(arr[0]||null);
    if(arr[0]) setCustomerName(arr[0].name);
  };

  const createCustomer = async () => {
    if(!customerName) return;
    const r = await fetch(`${base}/api/customers`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: customerName, phone })});
    if(r.ok){
      await searchCustomer();
    }
  };

  const addLabor = () => setLabor([...labor, { code:"", description:"", flat_hours:1, rate:100, discount:0 }]);
  const addPart = () => setParts([...parts, { part_id:"", name:"", quantity:1, price:0, discount:0 }]);
  const addMaterial = () => setMaterials([...materials, { description:"", cost:0 }]);
  const addOutside = () => setOutside([...outside, { description:"", cost:0 }]);

  const updateItem = (list, setList, idx, key, value) => {
    const copy = [...list];
    copy[idx] = { ...copy[idx], [key]: value };
    setList(copy);
  };

  const toggleTech = (id) => {
    setTechs((prev)=> prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const createJob = async () => {
    if(!vehicle?.id || !customer?.id){
      alert(lang==='ar'? 'الرجاء اختيار مركبة وعميل' : 'Please select vehicle and customer');
      return;
    }
    const payload = {
      vehicle_id: vehicle.id,
      customer_id: customer.id,
      advisor_id: null,
      technician_ids: techs,
      complaint_notes: complaint,
      check_notes: checkNotes,
      labor,
      parts,
      materials,
      outside,
      status: 'open',
      vat_rate: 0.15,
    };
    const r = await fetch(`${base}/api/jobcards`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    if(r.ok){
      alert(dict.success);
      // reset minimal
      setLabor([]); setParts([]); setMaterials([]); setOutside([]); setComplaint(""); setCheckNotes(""); setTechs([]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2"><ClipboardList className="w-5 h-5"/> {dict.title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="text-sm text-slate-400 flex items-center gap-2"><Car className="w-4 h-4"/> {dict.vin}</div>
          <div className="flex gap-2">
            <input value={vin} onChange={e=>setVin(e.target.value)} placeholder={dict.scanVin} className="flex-1 px-3 py-2 rounded-lg bg-slate-800"/>
            <button onClick={searchVehicle} className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"><Search className="w-4 h-4"/></button>
            <button onClick={registerVehicle} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"><PlusCircle className="w-4 h-4"/></button>
          </div>
          {vehicle && (
            <div className="text-xs text-slate-300">{dict.vehicleFound}: {vehicle.vin}</div>
          )}
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="text-sm text-slate-400 flex items-center gap-2"><User className="w-4 h-4"/> {dict.customerPhone}</div>
          <div className="flex gap-2">
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder={dict.customerPhone} className="flex-1 px-3 py-2 rounded-lg bg-slate-800"/>
            <button onClick={searchCustomer} className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"><Search className="w-4 h-4"/></button>
          </div>
          <div className="flex gap-2">
            <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder={dict.customerName} className="flex-1 px-3 py-2 rounded-lg bg-slate-800"/>
            <button onClick={createCustomer} className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500"><UserPlus className="w-4 h-4"/></button>
          </div>
          {customer && (
            <div className="text-xs text-slate-300">{customer.name} · {customer.phone}</div>
          )}
        </div>

        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
          <div className="text-sm text-slate-400 flex items-center gap-2"><Users className="w-4 h-4"/> {dict.technician}</div>
          <div className="flex flex-wrap gap-2">
            {availableTechs.map(t=> (
              <button key={t.id} onClick={()=>toggleTech(t.id)} className={`px-3 py-1.5 rounded-lg border ${techs.includes(t.id)?'bg-blue-600 border-blue-500':'bg-slate-800 border-slate-700'}`}>{t.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title={<span className="flex items-center gap-2"><Wrench className="w-4 h-4"/> Labor</span>} onAdd={addLabor}>
          {labor.map((l, idx)=> (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input className="col-span-2 px-2 py-1 rounded bg-slate-800" placeholder="Code" value={l.code} onChange={e=>updateItem(labor,setLabor,idx,'code',e.target.value)} />
              <input className="col-span-5 px-2 py-1 rounded bg-slate-800" placeholder="Description" value={l.description} onChange={e=>updateItem(labor,setLabor,idx,'description',e.target.value)} />
              <input type="number" className="col-span-1 px-2 py-1 rounded bg-slate-800" placeholder={dict.hours} value={l.flat_hours} onChange={e=>updateItem(labor,setLabor,idx,'flat_hours',parseFloat(e.target.value))} />
              <input type="number" className="col-span-2 px-2 py-1 rounded bg-slate-800" placeholder={dict.rate} value={l.rate} onChange={e=>updateItem(labor,setLabor,idx,'rate',parseFloat(e.target.value))} />
              <input type="number" className="col-span-2 px-2 py-1 rounded bg-slate-800" placeholder={dict.discount} value={l.discount} onChange={e=>updateItem(labor,setLabor,idx,'discount',parseFloat(e.target.value))} />
            </div>
          ))}
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Parts</span>} onAdd={addPart}>
          {parts.map((p, idx)=> (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input className="col-span-3 px-2 py-1 rounded bg-slate-800" placeholder="Part ID / SKU" value={p.part_id} onChange={e=>updateItem(parts,setParts,idx,'part_id',e.target.value)} />
              <input className="col-span-5 px-2 py-1 rounded bg-slate-800" placeholder="Name" value={p.name} onChange={e=>updateItem(parts,setParts,idx,'name',e.target.value)} />
              <input type="number" className="col-span-2 px-2 py-1 rounded bg-slate-800" placeholder={dict.qty} value={p.quantity} onChange={e=>updateItem(parts,setParts,idx,'quantity',parseInt(e.target.value||'0',10))} />
              <input type="number" className="col-span-2 px-2 py-1 rounded bg-slate-800" placeholder={dict.price} value={p.price} onChange={e=>updateItem(parts,setParts,idx,'price',parseFloat(e.target.value))} />
            </div>
          ))}
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Materials</span>} onAdd={addMaterial}>
          {materials.map((m, idx)=> (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input className="col-span-9 px-2 py-1 rounded bg-slate-800" placeholder="Description" value={m.description} onChange={e=>updateItem(materials,setMaterials,idx,'description',e.target.value)} />
              <input type="number" className="col-span-3 px-2 py-1 rounded bg-slate-800" placeholder={dict.price} value={m.cost} onChange={e=>updateItem(materials,setMaterials,idx,'cost',parseFloat(e.target.value))} />
            </div>
          ))}
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Outside</span>} onAdd={addOutside}>
          {outside.map((o, idx)=> (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input className="col-span-9 px-2 py-1 rounded bg-slate-800" placeholder="Description" value={o.description} onChange={e=>updateItem(outside,setOutside,idx,'description',e.target.value)} />
              <input type="number" className="col-span-3 px-2 py-1 rounded bg-slate-800" placeholder={dict.price} value={o.cost} onChange={e=>updateItem(outside,setOutside,idx,'cost',parseFloat(e.target.value))} />
            </div>
          ))}
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-sm text-slate-400">{dict.complaint}</div>
          <textarea value={complaint} onChange={e=>setComplaint(e.target.value)} className="mt-2 w-full h-24 bg-slate-800 rounded p-2"/>
        </div>
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="text-sm text-slate-400">{dict.notes}</div>
          <textarea value={checkNotes} onChange={e=>setCheckNotes(e.target.value)} className="mt-2 w-full h-24 bg-slate-800 rounded p-2"/>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={createJob} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2"><CheckSquare className="w-4 h-4"/> {dict.createJob}</button>
      </div>
    </div>
  );
}

function Panel({ title, children, onAdd }){
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-300">{title}</div>
        <button onClick={onAdd} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"><PlusCircle className="w-4 h-4"/></button>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

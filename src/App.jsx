import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import QuickActions from './components/QuickActions'
import ServiceIntake from './components/ServiceIntake'
import PartsPOS from './components/PartsPOS'
import CashierQueue from './components/CashierQueue'

function App() {
  const [lang, setLang] = useState('en')
  return (
    <Layout lang={lang} onLangChange={()=>setLang(lang==='en' ? 'ar' : 'en')}>
      <div className="space-y-10">
        <QuickActions lang={lang} />
        <Dashboard lang={lang} />
        <ServiceIntake lang={lang} />
        <PartsPOS lang={lang} />
        <CashierQueue lang={lang} />
      </div>
    </Layout>
  )
}

export default App

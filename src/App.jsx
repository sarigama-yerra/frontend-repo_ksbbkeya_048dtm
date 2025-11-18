import { useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import QuickActions from './components/QuickActions'

function App() {
  const [lang, setLang] = useState('en')
  return (
    <Layout lang={lang} onLangChange={()=>setLang(lang==='en' ? 'ar' : 'en')}>
      <div className="space-y-6">
        <QuickActions lang={lang} />
        <Dashboard lang={lang} />
      </div>
    </Layout>
  )
}

export default App

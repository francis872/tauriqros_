import { useState, useRef } from 'react'
import { Search, Plus, Send, Mail, X, AtSign, Briefcase, Landmark, User } from 'lucide-react'
import { useDexStore, type DexStatus, type ContactType } from './dexStore'

const STATUS_LABELS: Record<DexStatus, string> = {
  online: 'En línea', available: 'Disponible', busy: 'Ocupada', idle: 'Ausente',
}
const STATUS_COLORS: Record<DexStatus, string> = {
  online: 'bg-emerald-500', available: 'bg-cyan-500', busy: 'bg-amber-500', idle: 'bg-slate-500',
}

const TYPE_ICON: Record<ContactType, React.ReactNode> = {
  personal:     <User size={9} />,
  business:     <Briefcase size={9} />,
  organization: <Landmark size={9} />,
}
const TYPE_BADGE: Record<ContactType, string> = {
  personal:     'bg-violet-500/20 text-violet-300 border-violet-500/30',
  business:     'bg-amber-500/20  text-amber-300  border-amber-500/30',
  organization: 'bg-teal-500/20   text-teal-300   border-teal-500/30',
}
const TYPE_LABEL: Record<ContactType, string> = {
  personal: 'Personal', business: 'Empresa', organization: 'Org.',
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export default function DexView() {
  const { contacts, messages, sendMessage, sendEmail, markRead } = useDexStore()
  const [search, setSearch] = useState('')
  const [activeContactId, setActiveContactId] = useState<string>(contacts[0]?.id ?? '')
  const [draft, setDraft] = useState('')
  const [composing, setComposing] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all')
  const bottomRef = useRef<HTMLDivElement>(null)

  const filtered = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || c.contactType === typeFilter
    return matchSearch && matchType
  })

  const activeContact = contacts.find((c) => c.id === activeContactId)
  const thread = messages.filter((m) => m.contactId === activeContactId)
  const unread = (contactId: string) => messages.filter((m) => m.contactId === contactId && !m.read && !m.fromMe).length

  function selectContact(id: string) {
    setActiveContactId(id)
    markRead(id)
  }

  function handleSend() {
    if (!draft.trim() || !activeContactId) return
    sendMessage(activeContactId, draft.trim())
    setDraft('')
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function openComposeForContact() {
    const contact = contacts.find((c) => c.id === activeContactId)
    setEmailTo(contact?.email ?? '')
    setComposing(true)
  }

  function handleSendEmail() {
    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) return
    const contact = contacts.find((c) => c.email?.toLowerCase() === emailTo.toLowerCase().trim())
    sendEmail(contact?.id ?? null, emailTo.trim(), emailSubject.trim(), emailBody.trim())
    setEmailTo('')
    setEmailSubject('')
    setEmailBody('')
    setComposing(false)
    if (contact) {
      setActiveContactId(contact.id)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <div className="flex h-full overflow-hidden relative">
      {/* Email compose overlay */}
      {composing && (
        <div className="absolute inset-0 z-10 flex items-start justify-center bg-slate-950/80 pt-8 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-cyan-400" />
                <span className="text-sm font-semibold text-slate-100">Nuevo correo</span>
              </div>
              <button type="button" onClick={() => setComposing(false)} aria-label="Cerrar" title="Cerrar"
                className="rounded-lg p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition">
                <X size={14} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2">
                <AtSign size={12} className="text-slate-500 flex-shrink-0" />
                <input
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="Destinatario (dirección de correo)"
                  aria-label="Para"
                  type="email"
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                {contacts.find((c) => c.email?.toLowerCase() === emailTo.toLowerCase().trim()) && (
                  <span className="text-[10px] text-emerald-400">
                    {contacts.find((c) => c.email?.toLowerCase() === emailTo.toLowerCase().trim())?.name}
                  </span>
                )}
              </div>
              <input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Asunto"
                aria-label="Asunto"
                className="w-full rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none"
              />
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Escribe tu mensaje..."
                aria-label="Cuerpo del correo"
                rows={6}
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-600">Correo enviado solo dentro de Dex</p>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40 transition"
                >
                  <Send size={11} />
                  Enviar correo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        <aside className="flex w-52 flex-col border-r border-white/[0.06] bg-slate-900/60 flex-shrink-0">
        <div className="border-b border-white/[0.06] p-2">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 text-xs font-bold text-cyan-400">💬 Dex</h2>
            <button type="button" onClick={() => { setEmailTo(''); setEmailSubject(''); setEmailBody(''); setComposing(true) }}
              title="Nuevo correo" aria-label="Nuevo correo"
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-cyan-400">
              <Mail size={13} />
            </button>
            <button type="button" title="Añadir contacto" aria-label="Añadir contacto" className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-cyan-400">
              <Plus size={13} />
            </button>
          </div>
          <p className="text-[10px] text-slate-600">Red de mensajería inteligente</p>
        </div>

        {/* Search */}
        <div className="border-b border-white/[0.06] p-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-2 py-1.5">
            <Search size={11} className="text-slate-500 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contacto"
              aria-label="Buscar contacto"
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none" />
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="flex border-b border-white/[0.06] px-2 py-1.5 gap-1 overflow-x-auto scrollbar-none">
          {(['all', 'personal', 'business', 'organization'] as const).map(f => (
            <button key={f} type="button" onClick={() => setTypeFilter(f)}
              className={`flex-shrink-0 rounded-md px-2 py-0.5 text-[9px] font-semibold transition ${
                typeFilter === f ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-600 hover:text-slate-400'
              }`}>
              {f === 'all' ? 'Todos' : f === 'personal' ? 'Personas' : f === 'business' ? 'Empresas' : 'Orgs'}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((contact) => {
            const cnt = unread(contact.id)
            const badge = TYPE_BADGE[contact.contactType]
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => selectContact(contact.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition ${
                  activeContactId === contact.id ? 'bg-cyan-500/10' : 'hover:bg-slate-800/60'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: contact.avatarColor ?? '#4b5563' }}>
                    {initials(contact.name)}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-slate-900 ${STATUS_COLORS[contact.status]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-xs font-medium text-slate-200">{contact.name}</p>
                    <span className={`flex-shrink-0 flex items-center gap-0.5 rounded border px-1 py-0.5 text-[8px] font-semibold ${badge}`}>
                      {TYPE_ICON[contact.contactType]}
                      {TYPE_LABEL[contact.contactType]}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">{STATUS_LABELS[contact.status]}</p>
                  {contact.industry && (
                    <p className="truncate text-[9px] text-slate-600">{contact.industry}</p>
                  )}
                </div>
                {cnt > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {cnt}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </aside>

      {/* Chat area */}
      {activeContact ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: activeContact.avatarColor ?? '#4b5563' }}>
                {initials(activeContact.name)}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-slate-900 ${STATUS_COLORS[activeContact.status]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-100 truncate">{activeContact.name}</p>
                <span className={`flex-shrink-0 flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[8px] font-semibold ${TYPE_BADGE[activeContact.contactType]}`}>
                  {TYPE_ICON[activeContact.contactType]}
                  {TYPE_LABEL[activeContact.contactType]}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${STATUS_COLORS[activeContact.status]}`} />
                <span className="text-[10px] text-slate-500">{STATUS_LABELS[activeContact.status]}</span>
                {activeContact.industry && (
                  <span className="text-[10px] text-slate-600">· {activeContact.industry}</span>
                )}
                {activeContact.website && (
                  <span className="text-[10px] text-slate-600 truncate">· {activeContact.website}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={openComposeForContact}
              title="Enviar correo"
              aria-label="Enviar correo"
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition"
            >
              <Mail size={12} />
              Correo
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {thread.length === 0 ? (
              <p className="text-center text-xs text-slate-600 py-8">Sin mensajes aún</p>
            ) : (
              thread.map((msg) => (
                <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'email' ? (
                    <div className={`max-w-[80%] rounded-2xl border text-xs ${
                      msg.fromMe
                        ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100 rounded-br-sm'
                        : 'border-white/[0.08] bg-slate-800/80 text-slate-200 rounded-bl-sm'
                    }`}>
                      <div className={`flex items-center gap-1.5 border-b px-3 py-1.5 ${msg.fromMe ? 'border-cyan-500/20' : 'border-white/[0.06]'}`}>
                        <Mail size={10} className={msg.fromMe ? 'text-cyan-400' : 'text-slate-500'} />
                        <span className={`text-[10px] font-semibold ${msg.fromMe ? 'text-cyan-400' : 'text-slate-400'}`}>
                          {msg.subject}
                        </span>
                      </div>
                      <div className="px-3 py-2">
                        {msg.toEmail && !msg.fromMe && (
                          <p className="text-[10px] text-slate-500 mb-1">De: {msg.toEmail}</p>
                        )}
                        {msg.toEmail && msg.fromMe && (
                          <p className="text-[10px] text-cyan-500/70 mb-1">Para: {msg.toEmail}</p>
                        )}
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className="mt-1 text-[10px] opacity-50 text-right">{formatTime(msg.sentAt)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${
                      msg.fromMe
                        ? 'bg-cyan-500/20 text-cyan-100 rounded-br-sm'
                        : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                    }`}>
                      <p>{msg.text}</p>
                      <p className="mt-1 text-[10px] opacity-50 text-right">{formatTime(msg.sentAt)}</p>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-white/[0.06] p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe un mensaje..."
              aria-label="Mensaje"
              className="flex-1 rounded-xl border border-white/[0.08] bg-slate-800/60 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim()}
              aria-label="Enviar"
              title="Enviar"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-600">
          Selecciona un contacto
        </div>
      )}
    </div>
  )
}

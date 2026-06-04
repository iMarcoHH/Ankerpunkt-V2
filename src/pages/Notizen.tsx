import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { StickyNote, Plus, Trash2, Edit2, Check, X } from 'lucide-react'

interface Note {
  id:         string
  user_id:    string
  title:      string
  content:    string
  color:      string
  created_at: string
}

const NOTE_COLORS = ['#E8A832','#C8392B','#3D5166','#9AA0A6','#4a6d8c']

// Local notes (no dedicated table needed — stored in Supabase notes table if it exists, else local)
export function NotizenPage() {
  const { userId } = useStore()
  const [notes, setNotes]       = useState<Note[]>([])
  const [showAdd, setAdd]       = useState(false)
  const [editId, setEditId]     = useState<string|null>(null)
  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [color, setColor]       = useState(NOTE_COLORS[0])
  const [loaded, setLoaded]     = useState(false)

  // Load once
  if (!loaded) {
    setLoaded(true)
    if (userId) {
      supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setNotes(data as Note[]) })
    }
  }

  function resetForm() { setTitle(''); setContent(''); setColor(NOTE_COLORS[0]); setEditId(null) }

  async function saveNote() {
    if (!title.trim()) return
    if (editId) {
      const up = { title, content, color }
      if (userId) await supabase.from('notes').update(up).eq('id', editId)
      setNotes(notes.map(n => n.id === editId ? { ...n, ...up } : n))
    } else {
      const note = { user_id: userId ?? 'demo', title, content, color }
      if (userId) {
        const { data: row } = await supabase.from('notes').insert(note).select().single()
        if (row) setNotes([row as Note, ...notes])
      } else {
        setNotes([{ ...note, id: Date.now().toString(), created_at: new Date().toISOString() }, ...notes])
      }
    }
    resetForm(); setAdd(false)
  }

  async function deleteNote(id: string) {
    if (!confirm('Notiz löschen?')) return
    if (userId) await supabase.from('notes').delete().eq('id', id)
    setNotes(notes.filter(n => n.id !== id))
  }

  function startEdit(n: Note) {
    setTitle(n.title); setContent(n.content); setColor(n.color)
    setEditId(n.id); setAdd(true)
  }

  return (
    <div className="p-5 space-y-5 pb-8">
      <div className="flex items-end justify-between pt-14">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-white">Notizen</h1>
          <p className="text-cement text-sm mt-0.5">Gedanken & Erinnerungen</p>
        </div>
        <button onClick={() => { resetForm(); setAdd(true) }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-display tracking-wide text-sm text-white"
          style={{ background:'#C8392B' }}>
          <Plus className="w-4 h-4"/> Neu
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl gap-4"
             style={{ border:'2px dashed rgba(61,81,102,0.4)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:'rgba(232,168,50,0.1)' }}>
            <StickyNote className="w-7 h-7" style={{ color:'#E8A832', opacity:0.6 }}/>
          </div>
          <p className="text-sm text-cement">Noch keine Notizen.</p>
          <button onClick={() => setAdd(true)} className="ak-btn ak-btn-secondary text-sm px-4 py-2 gap-2">
            <Plus className="w-4 h-4"/> Erste Notiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {notes.map((note, i) => (
            <motion.div key={note.id} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
              className="ak-card p-5 group flex flex-col gap-3"
              style={{ borderTopWidth:3, borderTopColor: note.color }}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white leading-snug flex-1">{note.title}</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => startEdit(note)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-cement hover:text-white"
                    style={{ background:'rgba(255,255,255,0.06)' }}>
                    <Edit2 className="w-3.5 h-3.5"/>
                  </button>
                  <button onClick={() => deleteNote(note.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-cement hover:text-red-400"
                    style={{ background:'rgba(200,57,43,0.12)' }}>
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </div>
              {note.content && (
                <p className="text-sm text-sand/70 whitespace-pre-wrap leading-relaxed line-clamp-4 flex-1">
                  {note.content}
                </p>
              )}
              <div className="pt-2 flex items-center justify-between" style={{ borderTop:'1px solid rgba(61,81,102,0.4)' }}>
                <span className="font-mono text-xs text-cement">
                  {new Date(note.created_at).toLocaleDateString('de-DE')}
                </span>
                <div className="w-3 h-3 rounded-full" style={{ background: note.color }}/>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Sheet */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setAdd(false)}>
          <div className="modal-sheet">
            <div className="flex justify-center mb-3"><div className="w-9 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.15)' }}/></div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-display text-white text-xl">{editId ? 'BEARBEITEN' : 'NEUE NOTIZ'}</span>
              <div className="flex gap-2">
                <button onClick={saveNote}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background:'rgba(232,168,50,0.2)', color:'#E8A832' }}>
                  <Check className="w-4 h-4"/>
                </button>
                <button onClick={() => { setAdd(false); resetForm() }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-cement"
                  style={{ background:'rgba(255,255,255,0.08)' }}>
                  <X className="w-4 h-4"/>
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <input className="ak-input font-semibold" placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} autoFocus/>
              <textarea className="ak-input resize-none" placeholder="Inhalt (optional)" rows={4}
                value={content} onChange={e => setContent(e.target.value)}
                style={{ fontFamily:"'IBM Plex Sans',sans-serif" }}/>
              <div>
                <p className="font-mono text-[9px] text-cement tracking-widest uppercase mb-2">Farbe</p>
                <div className="flex gap-2">
                  {NOTE_COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full transition-all"
                      style={{ background:c, outline: color===c?`2px solid ${c}`:'none', outlineOffset:2 }}/>
                  ))}
                </div>
              </div>
              <button onClick={saveNote} className="w-full ak-btn ak-btn-primary">
                {editId ? 'Speichern' : 'Erstellen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

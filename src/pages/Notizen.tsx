import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { supabase } from '../lib/supabase'
import { Plus, X, Trash2, StickyNote } from 'lucide-react'

const COLORS = ['#FEF3C7','#DBEAFE','#D1FAE5','#FCE7F3','#EDE9FE','#FEE2E2']

interface Note { id:string; user_id:string; title:string; content:string; color:string; created_at:string }

export function NotizenPage() {
  const { userId } = useStore()
  const [notes,    setNotes]   = useState<Note[]>([])
  const [loaded,   setLoaded]  = useState(false)
  const [showAdd,  setAdd]     = useState(false)
  const [selected, setSelected]= useState<Note|null>(null)

  if (!loaded) {
    if (userId) supabase.from('notes').select('*').eq('user_id',userId).order('created_at',{ascending:false}).then(({data})=>{ if(data)setNotes(data); setLoaded(true) })
    else setLoaded(true)
  }

  async function del(id: string) {
    if (userId) await supabase.from('notes').delete().eq('id',id)
    setNotes(notes.filter(n=>n.id!==id))
    setSelected(null)
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <div style={{ padding:'56px 20px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <h1 className="page-title">Notizen</h1>
        <button onClick={()=>setAdd(true)}
          style={{ width:40,height:40,borderRadius:12,background:'var(--accent)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginTop:4 }}>
          <Plus width={20} height={20} style={{ color:'white' }}/>
        </button>
      </div>

      <div style={{ padding:'0 20px' }}>
        {notes.length===0 ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 0',gap:12 }}>
            <StickyNote width={48} height={48} style={{ color:'var(--tertiary)',opacity:0.3 }}/>
            <p style={{ fontSize:15,color:'var(--tertiary)' }}>Noch keine Notizen.</p>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            {notes.map((note,i)=>(
              <motion.button key={note.id} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.04}}
                onClick={()=>setSelected(note)}
                style={{ background:note.color,borderRadius:20,padding:16,textAlign:'left',border:'none',cursor:'pointer',boxShadow:'var(--shadow-sm)',WebkitTapHighlightColor:'transparent' }}>
                <p style={{ fontSize:14,fontWeight:700,color:'#1a1a1a',marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{note.title||'Notiz'}</p>
                <p style={{ fontSize:12,color:'#444',lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:4,WebkitBoxOrient:'vertical',overflow:'hidden' }}>{note.content}</p>
                <p style={{ fontSize:10,color:'#888',marginTop:8 }}>{new Date(note.created_at).toLocaleDateString('de-DE')}</p>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {showAdd   && <NoteSheet onClose={()=>setAdd(false)}    onSave={n=>{setNotes([n,...notes]);setAdd(false)}} userId={userId}/>}
      {selected  && <NoteSheet note={selected} onClose={()=>setSelected(null)} onSave={n=>{setNotes(notes.map(x=>x.id===n.id?n:x));setSelected(null)}} onDelete={()=>del(selected.id)} userId={userId}/>}
    </div>
  )
}

function NoteSheet({ note, onClose, onSave, onDelete, userId }: {
  note?: Note; onClose:()=>void; onSave:(n:Note)=>void; onDelete?:()=>void; userId:string|null
}) {
  const [title,   setTitle]   = useState(note?.title??'')
  const [content, setContent] = useState(note?.content??'')
  const [color,   setColor]   = useState(note?.color??COLORS[0])
  const [saving,  setSaving]  = useState(false)

  async function save() {
    setSaving(true)
    try {
      if (note) {
        if (userId) await supabase.from('notes').update({title,content,color}).eq('id',note.id)
        onSave({...note,title,content,color})
      } else {
        const entry = { user_id:userId??'demo', title, content, color }
        if (userId) {
          const { data:row } = await supabase.from('notes').insert(entry).select().single()
          if (row) onSave(row as Note)
          else onSave({...entry, id:Date.now().toString(), created_at:new Date().toISOString()} as Note)
        } else {
          onSave({...entry, id:Date.now().toString(), created_at:new Date().toISOString()} as Note)
        }
      }
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-sheet" style={{ background:color }}>
        <div style={{ width:36,height:4,borderRadius:2,background:'rgba(0,0,0,0.1)',margin:'0 auto 16px' }}/>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <div style={{ display:'flex',gap:6 }}>
            {COLORS.map(c=>(
              <button key={c} onClick={()=>setColor(c)}
                style={{ width:22,height:22,borderRadius:'50%',background:c,border:`2px solid ${color===c?'#333':'transparent'}`,cursor:'pointer' }}/>
            ))}
          </div>
          <div style={{ display:'flex',gap:8 }}>
            {onDelete && (
              <button onClick={onDelete} style={{ width:30,height:30,borderRadius:10,background:'rgba(0,0,0,0.08)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
                <Trash2 width={14} height={14} style={{ color:'#666' }}/>
              </button>
            )}
            <button onClick={onClose} style={{ width:30,height:30,borderRadius:10,background:'rgba(0,0,0,0.08)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer' }}>
              <X width={14} height={14} style={{ color:'#666' }}/>
            </button>
          </div>
        </div>
        <input
          style={{ width:'100%',background:'transparent',border:'none',outline:'none',fontSize:20,fontWeight:700,color:'#1a1a1a',marginBottom:12,fontFamily:'var(--font)' }}
          placeholder="Titel..." value={title} onChange={e=>setTitle(e.target.value)}/>
        <textarea
          style={{ width:'100%',background:'transparent',border:'none',outline:'none',fontSize:15,color:'#333',lineHeight:1.6,resize:'none',minHeight:160,fontFamily:'var(--font)' }}
          placeholder="Notiz schreiben..." value={content} onChange={e=>setContent(e.target.value)}/>
        <button onClick={save} disabled={saving}
          style={{ width:'100%',height:50,borderRadius:16,background:'rgba(0,0,0,0.1)',border:'none',color:'#333',fontWeight:600,fontSize:15,cursor:'pointer',marginTop:12 }}>
          {saving?'Speichern...':'Speichern'}
        </button>
      </div>
    </div>
  )
}

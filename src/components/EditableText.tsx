import { useState } from 'react'

// As props de um componente também são uma interface.
// O `?` marca um campo como opcional.
interface EditableTextProps {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  className?: string
}

/** Texto que vira campo de edição ao clicar. Enter salva, Esc cancela. */
export function EditableText({ value, onSave, placeholder = 'Sem nome', className = '' }: EditableTextProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function startEditing() {
    setDraft(value)
    setEditing(true)
  }

  function commit() {
    onSave(draft.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        placeholder={placeholder}
        maxLength={80}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className={`w-full rounded-md border border-slate-300 bg-white px-2 py-1 outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 ${className}`}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title="Clique para editar o nome"
      className={`group inline-flex max-w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-slate-200/60 dark:hover:bg-slate-800 ${className}`}
    >
      <span className={`truncate ${value ? '' : 'text-slate-400 italic'}`}>{value || placeholder}</span>
      <span aria-hidden className="text-sm text-slate-400 opacity-60 group-hover:opacity-100">✎</span>
    </button>
  )
}

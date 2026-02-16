'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button className="btn-primary w-full" disabled={pending}>
            {pending ? 'Csatolás...' : 'Összekapcsolás'}
        </button>
    )
}

export default function LinkParentForm({
    linkAction,
    students,
    parents
}: {
    linkAction: any,
    students: any[],
    parents: any[]
}) {
    return (
        <form action={linkAction} className="grid grid-cols-1 gap-4 md:grid-cols-3 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="md:col-span-3 mb-2">
                <h3 className="font-semibold text-gray-700">Szülő – Tanuló Csatolása</h3>
            </div>

            <select name="parent_id" required defaultValue="" className="input-field bg-white">
                <option value="" disabled>Válassz Szülőt</option>
                {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
            </select>

            <select name="student_id" required defaultValue="" className="input-field bg-white">
                <option value="" disabled>Válassz Tanulót</option>
                {students.map(s => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
            </select>

            <SubmitButton />
        </form>
    )
}

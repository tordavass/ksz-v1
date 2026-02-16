'use client'

import { useState } from 'react'

type Company = {
    id: string
    name: string
}

export default function AddUserForm({ createUserAction, companies }: { createUserAction: any, companies: Company[] }) {
    const [selectedRole, setSelectedRole] = useState('')

    const showCompanySelect = selectedRole === 'business_contact' || selectedRole === 'business_owner'

    return (
        <form action={createUserAction} className="grid grid-cols-1 gap-4 md:grid-cols-5 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="md:col-span-5 mb-2">
                <h3 className="font-semibold text-gray-700">Új Felhasználó Hozzáadása</h3>
            </div>

            <input name="full_name" placeholder="Teljes Név" required className="input-field" />
            <input name="email" type="email" placeholder="Email" required className="input-field" />
            <input name="password" type="password" placeholder="Jelszó" required className="input-field" />

            <select
                name="role"
                required
                defaultValue=""
                className="input-field bg-white"
                onChange={(e) => setSelectedRole(e.target.value)}
            >
                <option value="" disabled>Szerepkör Kiválasztása</option>
                <option value="student">Tanuló</option>
                <option value="parent">Szülő</option>
                <option value="homeroom_teacher">Tanár</option>
                <option value="principal">Igazgató</option>
                <option value="business_owner">Szervezeti Vezető</option>
                <option value="business_contact">Szervezeti Kapcsolattartó</option>
                <option value="admin">Adminisztrátor</option>
            </select>

            {showCompanySelect ? (
                <select
                    name="company_id"
                    required
                    defaultValue=""
                    className="input-field bg-white md:col-span-1"
                >
                    <option value="" disabled>Szervezet Kiválasztása</option>
                    {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            ) : (
                <button className="btn-primary w-full">Hozzáadás</button>
            )}

            {showCompanySelect && (
                <button className="btn-primary w-full">Hozzáadás</button>
            )}
        </form>
    )
}

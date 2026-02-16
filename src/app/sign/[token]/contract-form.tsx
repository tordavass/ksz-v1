'use client'

import { useState } from 'react'
import { signContractByToken } from './actions'

interface ContractFormProps {
    token: string
    schoolName: string
    schoolCity: string
    companyName: string
    createdAt: string
}

import { useRouter } from 'next/navigation'

export default function ContractForm({ token, schoolName, schoolCity, companyName, createdAt }: ContractFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        ownerName: '',
        ownerContact: '',
        contactName: '',
        contactEmail: '',
        isDualRole: false
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const result = await signContractByToken(token, formData)

            if (result && result.autoLogin) {
                // Redirect to Password Setup AND pass the invite info
                const query = result.inviteSent ? `?invited=${encodeURIComponent(result.contactEmail)}` : ''
                router.push(`/business/set-password${query}`)
                // Fallback if Owner login failed (e.g. they existed) but success otherwise
                setFormData(prev => ({ ...prev, contactEmail: result.contactEmail }))
                setIsSuccess(true)
            }
        } catch (error: any) {
            alert('Hiba történt: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-12 rounded-lg shadow-xl text-center max-w-lg border border-gray-200">
                    <div className="text-6xl mb-6">✍️✅</div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Sikeres Aláírás</h1>
                    <p className="text-gray-600 font-serif text-lg leading-relaxed mb-4">
                        A szerződést rögzítettük.
                    </p>
                    <div className="bg-blue-50 p-4 rounded text-blue-800 text-sm font-sans text-left">
                        <p className="mb-2"><strong>Következő lépés:</strong></p>
                        <p>
                            Meghívót küldtünk a kapcsolattartónak (<strong>{formData.contactEmail}</strong>).
                            Kérjük, kattintson az emailben található linkre a fiókja aktiválásához és a jelszó beállításához.
                        </p>

                        <div className="mt-4 pt-4 border-t border-blue-200 text-xs text-gray-500">
                            <strong>Fontos:</strong>
                            <br />
                            Mivel éles rendszerhez kapcsolódunk, kérjük ellenőrizze a <strong>{formData.contactEmail}</strong> postafiókját (a Spam mappát is)!
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-200 py-12 px-4 md:px-8 font-serif">
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm] p-[25mm] relative text-justify text-gray-900 leading-relaxed md:text-lg">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider mb-2">Együttműködési Megállapodás</h1>
                    <p className="text-gray-600 italic">Iskolai Közösségi Szolgálat teljesítéséről</p>
                </div>

                {/* Parties */}
                <div className="mb-8 space-y-4">
                    <p>
                        amely létrejött egyrészről a(z) <strong>{schoolName}</strong> ({schoolCity}, képviseli: Igazgató), mint <strong>Iskola</strong>,
                    </p>
                    <p>
                        másrészről a(z) <strong>{companyName}</strong>, mint <strong>Fogadó Szervezet</strong> között, az alábbi feltételekkel:
                    </p>
                </div>

                {/* Body Text */}
                <div className="space-y-4 mb-12">
                    <p>
                        1. A Fogadó Szervezet vállalja, hogy biztosítja a tanulók számára a közösségi szolgálat teljesítésének lehetőségét, az ehhez szükséges feltételeket, valamint a szakmai felügyeletet.
                    </p>
                    <p>
                        2. Az Iskola vállalja, hogy a tanulókat tájékoztatja a közösségi szolgálattal kapcsolatos kötelezettségeikről, és a teljesített órákat a Fogadó Szervezet igazolása alapján adminisztrálja.
                    </p>
                    <p>
                        3. A felek kijelentik, hogy a hatályos jogszabályoknak megfelelően működnek együtt a tanulók nevelése-oktatása érdekében.
                    </p>
                    <p>
                        4. Jelen megállapodás határozatlan időre szól, és mindkét fél részéről írásban felmondható.
                    </p>
                </div>

                {/* Date */}
                <div className="mb-16">
                    <p>
                        Kelt: {schoolCity}, {new Date(/*createdAt*/ new Date()).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Signatures Form */}
                <form onSubmit={handleSubmit} className="mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 align-top">

                        {/* School Signature (Placeholder) */}
                        <div className="text-center opacity-50 select-none">
                            <div className="border-b-2 border-black border-dotted mb-4 h-16 flex items-end justify-center pb-2 font-dancing-script text-2xl">
                                (Igazgatói Aláírás Helye)
                            </div>
                            <p className="font-bold">{schoolName}</p>
                            <p className="text-sm">képviseletében</p>
                        </div>

                        {/* Company Signature (Active Form) */}
                        <div className="text-center relative">
                            {/* Floating "Fill me" hint */}
                            <div className="absolute -top-10 left-0 right-0 text-blue-600 text-sm animate-bounce font-sans font-bold">
                                ↓ Kérem töltse ki itt
                            </div>

                            <div className="space-y-6 text-left">
                                {/* Owner Section */}
                                <div>
                                    <h4 className="font-bold text-sm uppercase tracking-wide mb-2 text-gray-500 font-sans border-b pb-1">Cégképviselő (Tulajdonos)</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <input
                                                type="text"
                                                required
                                                className="w-full border-b-2 border-black border-dotted bg-blue-50 focus:bg-white text-center font-bold text-lg py-1 outline-none focus:border-blue-600 transition-colors placeholder-gray-400 font-sans"
                                                placeholder="Az Ön Neve"
                                                value={formData.ownerName}
                                                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="email"
                                                required
                                                className="w-full border-b-2 border-black border-dotted bg-blue-50 focus:bg-white text-center text-md py-1 outline-none focus:border-blue-600 transition-colors placeholder-gray-400 font-sans"
                                                placeholder="Tulajdonos Email Címe"
                                                value={formData.ownerContact}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    ownerContact: e.target.value,
                                                    contactEmail: formData.isDualRole ? e.target.value : formData.contactEmail
                                                })}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center bg-gray-50 p-2 rounded border border-gray-200">
                                        <input
                                            id="isDualRole"
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            checked={formData.isDualRole}
                                            onChange={e => setFormData({
                                                ...formData,
                                                isDualRole: e.target.checked,
                                                // If checked, copy owner details to contact immediately? 
                                                // Or just let backend handle it? Better to copy for UI consistency if we hide inputs.
                                                // Actually let's clear them if checked so validation doesn't fail on hidden fields if we had `required`.
                                                // But wait, if we hide them, we shouldn't render them with 'required'.
                                                contactName: e.target.checked ? formData.ownerName : '',
                                                contactEmail: e.target.checked ? formData.ownerContact : ''
                                            })}
                                        />
                                        <label htmlFor="isDualRole" className="ml-2 block text-sm text-gray-900 font-sans font-medium">
                                            Én vagyok a kapcsolattartó is.
                                        </label>
                                    </div>
                                </div>

                                {/* Contact Section - Conditionally Hidden */}
                                {!formData.isDualRole && (
                                    <div className="pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <h4 className="font-bold text-sm uppercase tracking-wide mb-2 text-gray-500 font-sans border-b pb-1">Kapcsolattartó (Manager)</h4>
                                        <p className="text-xs text-blue-600 mb-2 font-sans">Erre az emailre küldjük a meghívót a rendszerbe.</p>
                                        <div className="space-y-3">
                                            <div>
                                                <input
                                                    type="text"
                                                    required={!formData.isDualRole}
                                                    className="w-full border-b-2 border-black border-dotted bg-blue-50 focus:bg-white text-center font-bold text-lg py-1 outline-none focus:border-blue-600 transition-colors placeholder-gray-400 font-sans"
                                                    placeholder="Kapcsolattartó Neve"
                                                    value={formData.contactName}
                                                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="email"
                                                    required={!formData.isDualRole}
                                                    className="w-full border-b-2 border-black border-dotted bg-blue-50 focus:bg-white text-center text-md py-1 outline-none focus:border-blue-600 transition-colors placeholder-gray-400 font-sans"
                                                    placeholder="Kapcsolattartói Email"
                                                    value={formData.contactEmail}
                                                    onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 text-center">
                                <p className="font-bold mt-2">{companyName}</p>
                                <p className="text-sm">képviseletében</p>
                            </div>

                            {/* Submit Button inside the paper */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-8 bg-blue-800 text-white font-sans px-8 py-3 rounded hover:bg-blue-900 transition flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isSubmitting ? 'Feldolgozás...' : '✒️ Megállapodás Aláírás és vezetői fiók létrehozása'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer Decoration */}
                <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-400 font-sans">
                    Digitálisan generált dokumentum | KSZ Rendszer
                </div>

            </div>
        </div>
    )
}

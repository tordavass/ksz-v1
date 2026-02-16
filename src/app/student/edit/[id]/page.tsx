import { getCompanies, getServiceLog, updateServiceLog } from '../../actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function EditLogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const log = await getServiceLog(id)
    const companies = await getCompanies()

    if (!log) {
        redirect('/student')
    }

    if (log.status !== 'pending') {
        return (
            <div className="min-h-screen p-8 flex justify-center items-center">
                <div className="text-center card p-8">
                    <h1 className="text-xl font-bold mb-4">Cannot Edit Log</h1>
                    <p className="mb-4">This log has already been {log.status} and cannot be modified.</p>
                    <Link href="/student" className="btn-primary">Back to Dashboard</Link>
                </div>
            </div>
        )
    }

    const updateAction = updateServiceLog.bind(null, log.id)

    return (
        <div className="min-h-screen p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-lg space-y-6">

                <header>
                    <Link href="/student" className="text-sm text-[var(--kreta-blue)] hover:underline mb-2 block">
                        ← Cancel and Back
                    </Link>
                    <h1 className="text-2xl font-bold">Edit Service Log</h1>
                </header>

                <div className="card p-6">
                    <form action={updateAction as any} className="space-y-4">

                        {/* Company Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Company / Organization</label>
                            <select
                                name="company_id"
                                required
                                defaultValue={log.company_id || ""}
                                className="input-field bg-white"
                            >
                                <option value="" disabled>Select Organization</option>
                                {companies?.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Date of Service</label>
                            <input
                                name="date"
                                type="date"
                                required
                                defaultValue={log.date_of_service}
                                className="input-field"
                            />
                        </div>

                        {/* Hours */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Hours Worked</label>
                            <input
                                name="hours"
                                type="number"
                                step="0.5"
                                min="0.5"
                                max="24"
                                required
                                defaultValue={log.hours_worked}
                                className="input-field"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Activity Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                required
                                defaultValue={log.description}
                                className="input-field"
                            />
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="btn-primary w-full">
                                Save Changes
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    )
}

import LoginForm from './login-form'

export default async function LoginPage(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams
    const message = (searchParams?.message || searchParams?.error) as string | undefined

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Bejelentkezés</h2>
                <LoginForm initialError={message} />
            </div>
        </div>
    )
}

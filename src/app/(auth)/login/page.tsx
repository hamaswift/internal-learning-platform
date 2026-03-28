import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="space-y-6 py-12">
      {/* ブランドロゴ */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">社内学習プラットフォームにサインイン</h1>
        <p className="mt-1.5 text-sm text-gray-500">アカウントにサインインして学習を続けましょう</p>
      </div>

      {/* カード */}
      <div className="rounded-lg border border-gray-300 bg-white p-8 shadow-sm">
        <LoginForm />
      </div>
    </div>
  )
}

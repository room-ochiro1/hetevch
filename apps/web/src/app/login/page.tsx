import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Хэтэвч админ</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Зөвхөн админ эрхтэй хэрэглэгч нэвтэрнэ.</p>
        <LoginForm />
      </div>
    </main>
  );
}

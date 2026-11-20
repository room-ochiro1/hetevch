import { SignOutButton } from '@/components/admin/sign-out-button';

export default function ForbiddenPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-8 text-center shadow-card">
        <h1 className="text-xl font-semibold">Хандах эрхгүй</h1>
        <p className="mt-2 mb-6 text-sm text-muted">
          Энэ бүртгэлд админ эрх алга. Өөр бүртгэлээр нэвтэрнэ үү.
        </p>
        <SignOutButton />
      </div>
    </main>
  );
}

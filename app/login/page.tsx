import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_440px] lg:items-start">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Authentication</p>
          <h1 className="mt-4 font-display text-5xl">Log in to start your first compliance scan.</h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Supabase magic-link auth is wired in. Once your project env vars are set, users can sign in and access only their own client data through row-level security.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

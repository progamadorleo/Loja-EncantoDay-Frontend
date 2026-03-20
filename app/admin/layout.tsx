import { AuthProvider } from "@/contexts/auth-context"

export const metadata = {
  title: "Admin - Loja da Day",
  description: "Painel administrativo da Loja da Day",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

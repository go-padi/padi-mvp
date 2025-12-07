import "./globals.css";
import TopNav from "@/components/TopNav";
import { AuthProvider } from "@/lib/auth-store";
import { TeachingModeProvider } from "@/lib/teachingModeContext";

export const metadata = { title: "Padi Teacher App", description: "Plan and run lessons with Padi" };

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[#f4f7ff] via-white to-[#f3f6ff] min-h-screen">
        <AuthProvider>
          <TeachingModeProvider>
            <TopNav />
            <main className="container py-8">{children}</main>
          </TeachingModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

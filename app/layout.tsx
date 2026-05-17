import "./globals.css";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth-store";
import { TeachingModeProvider } from "@/lib/teachingModeContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { AnalyticsProvider } from "@/app/providers/analytics-provider";

export const metadata = {
  title: "Padi Teacher App",
  description: "Plan and run lessons with Padi",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[#f4f7ff] via-white to-[#f3f6ff] min-h-screen">
        <AuthProvider>
          <AnalyticsProvider>
            <TeachingModeProvider>
              <RoleGuard />
              <TopNav />
              <main className="container py-8">{children}</main>
              <Footer />
            </TeachingModeProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

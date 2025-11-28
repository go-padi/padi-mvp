import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata = { title: "Padi Teacher App", description: "Plan and run lessons with Padi" };

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-[#f4f7ff] via-white to-[#f3f6ff] min-h-screen">
        <TopNav />
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}

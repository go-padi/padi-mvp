import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata = { title: "Padi Teacher App", description: "Plan and run lessons with Padi" };

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en"><body><TopNav /><main className="container py-6">{children}</main></body></html>
  );
}

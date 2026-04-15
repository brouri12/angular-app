import { Outlet } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop";
import { ScrollToTopButton } from "../components/ScrollToTopButton";
import { LoadingBar } from "../components/LoadingBar";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <LoadingBar />
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
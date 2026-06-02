import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { motion, AnimatePresence } from "framer-motion";

export function Shell() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="ml-60 flex min-h-screen flex-col">
        <TopBar />
        <main className="flex-1 px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

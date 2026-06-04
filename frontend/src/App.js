import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { Shell } from "@/components/shell/Shell";
import { Toaster } from "@/components/ui/sonner";

import Login, { ENTERED_KEY } from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Athletes from "@/pages/Athletes";
import Training from "@/pages/Training";
import Medical from "@/pages/Medical";
import SportsScience from "@/pages/SportsScience";
import Nutrition from "@/pages/Nutrition";
import Assessments from "@/pages/Assessments";
import Analytics from "@/pages/Analytics";
import AICopilot from "@/pages/AICopilot";

// Demo entry gate. The app opens on the credential-free sign-in landing once per
// browser session; after a persona is chosen (or "skip" is clicked) the flag is
// set and the in-app shell takes over. Switching persona later uses the TopBar
// account menu, so this never gets in the way mid-demo.
function EntryGate({ children }) {
  const entered =
    typeof window !== "undefined" && window.sessionStorage.getItem(ENTERED_KEY) === "1";
  return entered ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <EntryGate>
                <Shell />
              </EntryGate>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/athletes" element={<Athletes />} />
            <Route path="/training" element={<Training />} />
            <Route path="/medical" element={<Medical />} />
            <Route path="/sports-science" element={<SportsScience />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/copilot" element={<AICopilot />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </AppProvider>
  );
}

export default App;

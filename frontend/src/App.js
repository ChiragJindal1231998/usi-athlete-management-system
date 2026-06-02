import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { Shell } from "@/components/shell/Shell";
import { Toaster } from "@/components/ui/sonner";

import Dashboard from "@/pages/Dashboard";
import Athletes from "@/pages/Athletes";
import Training from "@/pages/Training";
import Medical from "@/pages/Medical";
import SportsScience from "@/pages/SportsScience";
import Nutrition from "@/pages/Nutrition";
import Assessments from "@/pages/Assessments";
import Analytics from "@/pages/Analytics";
import AICopilot from "@/pages/AICopilot";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Shell />}>
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

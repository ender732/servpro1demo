import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ClientPortal } from "@/components/restorflow/ClientPortal";
import { Header } from "@/components/restorflow/Header";
import { IncidentList } from "@/components/restorflow/IncidentList";
import { PrintEstimate } from "@/components/restorflow/PrintEstimate";
import { TechWorkspace } from "@/components/restorflow/TechWorkspace";
import { StoreProvider, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RestorFlow — Field Scoping & Client Portal" },
      { name: "description", content: "AI room scoping, IICRC S500 equipment sizing, line-item quotes and homeowner e-sign for restoration crews." },
      { property: "og:title", content: "RestorFlow — Field Scoping & Client Portal" },
      { property: "og:description", content: "AI room scoping, equipment sizing, quotes and homeowner sign-off in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <StoreProvider>
      <App />
      <Toaster />
    </StoreProvider>
  );
}

function App() {
  const { s } = useStore();
  return (
    <div className="min-h-screen">
      <Header />
      <main className="no-print">
        {s.persona === "client" ? <ClientPortal /> : s.view === "list" ? <IncidentList /> : <TechWorkspace />}
      </main>
      <PrintEstimate />
    </div>
  );
}

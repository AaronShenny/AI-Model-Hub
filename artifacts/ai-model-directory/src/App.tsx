import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import Directory from "@/pages/Directory";
import ModelDetail from "@/pages/ModelDetail";
import Compare from "@/pages/Compare";
import Glossary from "@/pages/Glossary";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRoutes() {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar compareCount={compareIds.length} />
      <main>
        <Switch>
          <Route path="/">
            <Directory compareIds={compareIds} onToggleCompare={toggleCompare} />
          </Route>
          <Route path="/model/:id">
            <ModelDetail compareIds={compareIds} onToggleCompare={toggleCompare} />
          </Route>
          <Route path="/compare">
            <Compare compareIds={compareIds} onToggleCompare={toggleCompare} />
          </Route>
          <Route path="/glossary">
            <Glossary />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

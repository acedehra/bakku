import { useAppState } from "./hooks/app/useAppState";
import AppLayout from "./components/app/AppLayout";

function App() {
  const appState = useAppState();
  return <AppLayout {...appState} />;
}

export default App;

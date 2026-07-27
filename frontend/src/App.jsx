import { AppLayout } from './components/layout/AppLayout';
import { DeviceGrid } from './components/dashboard/DeviceGrid';
import './index.css';

function App() {
  return (
    <AppLayout>
      <DeviceGrid />
    </AppLayout>
  );
}

export default App;

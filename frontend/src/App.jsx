import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DeviceGrid } from './components/dashboard/DeviceGrid';
import { DeviceDetail } from './components/device/DeviceDetail';
import './index.css';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DeviceGrid />} />
          <Route path="/device/:id" element={<DeviceDetail />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;

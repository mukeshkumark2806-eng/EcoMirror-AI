import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import LoadingScreen from '../ui/LoadingScreen';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__main">
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

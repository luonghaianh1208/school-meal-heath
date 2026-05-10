/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import MealTracking from './pages/MealTracking';
import NutritionCalc from './pages/NutritionCalc';
import AIInsights from './pages/AIInsights';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="meal-tracking" element={<MealTracking />} />
            <Route path="nutrition" element={<NutritionCalc />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
            <Route 
              path="admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Admin />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationOptInPrompt } from './components/notifications/NotificationOptInPrompt';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { ScrollToTop } from './components/common/ScrollToTop';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { SellPage } from './pages/SellPage';
import { MessagesPage } from './pages/MessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SafetyPage } from './pages/SafetyPage';

const ProductDetailsRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailsPage key={id} />;
};

export const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <MarketplaceProvider>
          <NotificationProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/product/:id" element={<ProductDetailsRoute />} />
                  
                  {/* Protected Routes */}
                  <Route path="/sell" element={
                    <ProtectedRoute>
                      <SellPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  
                  {/* Admin Route */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboardPage />
                    </AdminRoute>
                  } />
                  
                  {/* Safety & Guidelines */}
                  <Route path="/safety" element={<SafetyPage />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>

              <Footer />
              <MobileNav />
              <NotificationOptInPrompt />
            </div>
          </NotificationProvider>
        </MarketplaceProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

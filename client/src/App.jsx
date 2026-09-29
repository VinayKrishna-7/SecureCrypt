import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RevealSecret from './pages/RevealSecret';
import NotFound from './pages/NotFound';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './components/ThemeContext';

export const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-1 pb-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/v/:id" element={<RevealSecret />} />
                <Route path="/note/:id" element={<RevealSecret />} />
                <Route path="/secret/:id" element={<RevealSecret />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

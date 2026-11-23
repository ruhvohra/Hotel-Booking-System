import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, useUser } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Hotels from "./pages/Hotels";
import HotelDetail from "./pages/HotelDetail";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";
import BookingConfirmation from "./pages/BookingConfirmation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminHotels from "./pages/admin/Hotels";
import AdminBookings from "./pages/admin/Bookings";
import AdminUsers from "./pages/admin/Users";
import AddHotel from "./pages/admin/AddHotel";
import Profile from "./pages/Profile";

console.log("✅ App.jsx loaded");

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Syncs Clerk auth to our backend
function ClerkSync() {
  const { user: clerkUser, isSignedIn } = useUser();
  const { syncClerkUser, user: authUser } = useAuth();

  useEffect(() => {
    if (isSignedIn && clerkUser && !authUser) {
      syncClerkUser(clerkUser);
    }
  }, [isSignedIn, clerkUser]);

  return null;
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <div className="spinner" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      {CLERK_KEY && <ClerkSync />}
      <Navbar />
      <main style={{ minHeight: "80vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/hotels/:id/book"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hotels"
            element={
              <ProtectedRoute adminOnly>
                <AdminHotels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hotels/add"
            element={
              <ProtectedRoute adminOnly>
                <AddHotel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hotels/edit/:id"
            element={
              <ProtectedRoute adminOnly>
                <AddHotel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute adminOnly>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const AppWithAuth = (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "DM Sans, sans-serif",
              borderRadius: "12px",
              background: "#1C1C1E",
              color: "#fff",
            },
            success: { iconTheme: { primary: "#C9A84C", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );

  if (CLERK_KEY) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY}>{AppWithAuth}</ClerkProvider>
    );
  }

  return AppWithAuth;
}

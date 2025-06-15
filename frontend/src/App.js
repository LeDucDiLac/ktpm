import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import HouseholdListScreen from './screens/HouseholdListScreen';
import HouseholdDetailScreen from './screens/HouseholdDetailScreen';
import HouseholdEditScreen from './screens/HouseholdEditScreen';
import FeeListScreen from './screens/FeeListScreen';
import FeeEditScreen from './screens/FeeEditScreen';
import PaymentListScreen from './screens/PaymentListScreen';
import PaymentCreateScreen from './screens/PaymentCreateScreen';
import PaymentSearchScreen from './screens/PaymentSearchScreen';
import PaymentDetailScreen from './screens/PaymentDetailScreen';
import ResidentListScreen from './screens/ResidentListScreen';
import ResidentEditScreen from './screens/ResidentEditScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import NotFoundScreen from './screens/NotFoundScreen';

function App() {
  // Define role groups for easier route management
  const adminOnly = ['admin'];
  const managerAdminRoles = ['admin', 'manager'];

  return (
    <Router>
      <AuthProvider>
        <Header />
        <main className="py-3">
          <Container>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LoginScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              
              {/* Basic Protected Routes - Available to all authenticated administrative users */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/profile" element={<DashboardScreen />} />
                
                {/* Basic Management Routes */}
                <Route path="/households" element={<HouseholdListScreen />} />
                <Route path="/households/:id" element={<HouseholdDetailScreen />} />
                <Route path="/households/create" element={<HouseholdEditScreen />} />
                
                <Route path="/residents" element={<ResidentListScreen />} />
                <Route path="/residents/create" element={<ResidentEditScreen />} />
                
                <Route path="/fees" element={<FeeListScreen />} />
                
                <Route path="/payments" element={<PaymentListScreen />} />
                <Route path="/payments/create" element={<PaymentCreateScreen />} />
                <Route path="/payments/search" element={<PaymentSearchScreen />} />
                <Route path="/payments/:id" element={<PaymentDetailScreen />} />
              </Route>
              
              {/* Routes accessible only to managers and admins */}
              <Route element={<RoleRoute allowedRoles={managerAdminRoles} />}>
                <Route path="/households/:id/edit" element={<HouseholdEditScreen />} />
                <Route path="/residents/:id" element={<ResidentEditScreen />} />
                <Route path="/residents/:id/edit" element={<ResidentEditScreen />} />
                <Route path="/fees/create" element={<FeeEditScreen />} />
                <Route path="/fees/:id" element={<FeeEditScreen />} />
                <Route path="/admin/reports" element={<DashboardScreen />} />
              </Route>
              
              {/* Routes accessible only to admin */}
              <Route element={<RoleRoute allowedRoles={adminOnly} />}>
                <Route path="/users" element={<UserListScreen />} />
                <Route path="/users/create" element={<UserEditScreen />} />
                <Route path="/users/:id/edit" element={<UserEditScreen />} />
              </Route>
              
              <Route path="*" element={<NotFoundScreen />} />
            </Routes>
          </Container>
        </main>
        <Footer />
      </AuthProvider>
    </Router>
  );
}

export default App; 
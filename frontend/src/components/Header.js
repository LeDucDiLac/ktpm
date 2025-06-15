import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);
  
  // Helper function to check if user is admin
  const isAdmin = () => userInfo && userInfo.role === 'admin';
  
  // Helper function to check if user is manager
  const isManager = () => userInfo && userInfo.role === 'manager';
  
  // Helper function to format user role
  const formatUserRole = (role) => {
    if (role === 'admin') {
      return 'Quản trị';
    } else if (role === 'manager') {
      return 'Quản lý';
    } else {
      return role;
    }
  };
  
  return (
    <header>
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to={userInfo ? '/dashboard' : '/'}>
            <Navbar.Brand>
              <i className="fas fa-building"></i> Chung Cư BlueMoon
            </Navbar.Brand>
          </LinkContainer>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {userInfo ? (
                <>
                  {/* Navigation items for all authenticated administrative users */}
                  <LinkContainer to="/dashboard">
                    <Nav.Link>
                      <i className="fas fa-chart-line"></i> Tổng quan
                    </Nav.Link>
                  </LinkContainer>
                  
                  <LinkContainer to="/households">
                    <Nav.Link>
                      <i className="fas fa-home"></i> Hộ gia đình
                    </Nav.Link>
                  </LinkContainer>
                  
                  <LinkContainer to="/residents">
                    <Nav.Link>
                      <i className="fas fa-users"></i> Cư dân
                    </Nav.Link>
                  </LinkContainer>
                  
                  <LinkContainer to="/fees">
                    <Nav.Link>
                      <i className="fas fa-file-invoice-dollar"></i> Phí
                    </Nav.Link>
                  </LinkContainer>
                  
                  {/* Payments dropdown menu */}
                  <NavDropdown
                    title={
                      <>
                        <i className="fas fa-money-bill-wave"></i> Thanh toán
                      </>
                    }
                    id="payment-menu"
                  >
                    <LinkContainer to="/payments">
                      <NavDropdown.Item>Danh sách thanh toán</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/payments/create">
                      <NavDropdown.Item>Tạo thanh toán mới</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/payments/search">
                      <NavDropdown.Item>Tìm kiếm thanh toán</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                  
                  {/* User dropdown menu */}
                  <NavDropdown 
                    title={
                      <>
                        <i className="fas fa-user"></i> {userInfo.name || userInfo.username} 
                        <span className="ms-1">({formatUserRole(userInfo.role)})</span>
                      </>
                    } 
                    id="username"
                  >
                    <LinkContainer to="/profile">
                      <NavDropdown.Item>Hồ sơ</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Item onClick={logout}>
                      Đăng xuất
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="fas fa-user"></i> Đăng nhập
                  </Nav.Link>
                </LinkContainer>
              )}
              
              {/* Admin menu - only show if user is admin */}
              {isAdmin() && (
                <NavDropdown title="Quản trị" id="adminmenu">
                  <LinkContainer to="/users">
                    <NavDropdown.Item>Quản lý người dùng</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/reports">
                    <NavDropdown.Item>Báo cáo</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
              
              {/* Manager menu - only show if user is manager */}
              {isManager() && (
                <NavDropdown title="Quản lý" id="managermenu">
                  <LinkContainer to="/admin/reports">
                    <NavDropdown.Item>Báo cáo</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header; 
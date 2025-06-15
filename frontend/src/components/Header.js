import React, { useContext } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import AuthContext from "../context/AuthContext";

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);

  // Helper function for role checks
  const checkRole = (role) => userInfo && userInfo.role === role;

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          {/* Brand with conditional link */}
          <LinkContainer to={userInfo ? "/dashboard" : "/"}>
            <Navbar.Brand>
              <i className="fas fa-building me-2"></i>
              BlueMoon
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="me-auto">
              {userInfo && (
                <>
                  <LinkContainer to="/dashboard">
                    <Nav.Link>
                      <i className="fas fa-chart-bar me-1"></i> Tổng quan
                    </Nav.Link>
                  </LinkContainer>

                  <NavDropdown
                    title={
                      <>
                        <i className="fas fa-file me-1"></i>Quản lý
                      </>
                    }
                    id="management"
                  >
                    <LinkContainer to="/households">
                      <NavDropdown.Item>
                        <i className="fas fa-home me-2"></i>Hộ gia đình
                      </NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/residents">
                      <NavDropdown.Item>
                        <i className="fas fa-users me-2"></i>Cư dân
                      </NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/fees">
                      <NavDropdown.Item>
                        <i className="fas fa-file-invoice-dollar me-2"></i>Phí
                      </NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>

                  <NavDropdown
                    title={
                      <>
                        <i className="fas fa-money-bill me-1"></i>Thanh toán
                      </>
                    }
                    id="payment"
                  >
                    <LinkContainer to="/payments/create">
                      <NavDropdown.Item>Tạo mới</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Divider />
                    <LinkContainer to="/payments">
                      <NavDropdown.Item>Danh sách</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/payments/search">
                      <NavDropdown.Item>Tìm kiếm</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                </>
              )}
            </Nav>

            <Nav>
              {userInfo ? (
                <>
                  {/* Admin Controls */}
                  {checkRole("admin") && (
                    <NavDropdown
                      title={
                        <>
                          <i className="fas fa-tools me-1"></i>Hệ thống
                        </>
                      }
                      id="admin-menu"
                    >
                      <LinkContainer to="/users">
                        <NavDropdown.Item>Người dùng</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/reports">
                        <NavDropdown.Item>Báo cáo</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}

                  {/* Manager Controls */}
                  {checkRole("manager") && (
                    <LinkContainer to="/admin/reports">
                      <Nav.Link>
                        <i className="fas fa-chart-line me-1"></i>Báo cáo
                      </Nav.Link>
                    </LinkContainer>
                  )}

                  {/* Logout Button */}
                  <Nav.Link onClick={logout} className="text-danger">
                    <i className="fas fa-sign-out-alt me-1"></i>
                    Đăng xuất
                  </Nav.Link>
                </>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Đăng nhập
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;

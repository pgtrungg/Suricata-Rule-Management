import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice'; // Đường dẫn slice logout của bạn
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png'; // Đường dẫn logo của bạn

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeLink, setActiveLink] = useState(null); // Trạng thái link đang được bấm

  const handleLogout = () => {
    dispatch(logout()); // Gọi action logout
    navigate('/login'); // Điều hướng về trang đăng nhập
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center h-16">
      <div className="flex items-center space-x-8">
        {/* Logo */}
        <Link to="/alerts" className="flex items-center">
          <img
            src={Logo}
            alt="Logo"
            className="mt-2 w-20 h-auto max-h-20 object-contain" // Giữ độ cao nhưng tăng chiều rộng
          />
        </Link>

        {/* Links */}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition transform hover:scale-105 active:scale-95"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;

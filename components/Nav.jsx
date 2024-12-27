"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faSearch, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './UI.css';
// utils/auth.js
import secureLocalStorage from "react-secure-storage";

export const handleLogin = async (employeeId, password) => {
  console.log("Login parameters:", employeeId, password);

  if (!employeeId || !password) {
    console.log("Both Employee ID and Password are required.");
    return { success: false, error: "Both Employee ID and Password are required." };
  }

  try {
    const response = await fetch("http://10.40.20.93:300/api/Login/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId, password }),
    });

    if (response.ok) {
      const data = await response.json();
      secureLocalStorage.setItem("nu", data.username); 
      secureLocalStorage.setItem("die", data.employeeId);
      secureLocalStorage.setItem("ep", password); 
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.error || "Authentication failed." };
    }
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "Network error occurred." };
  }
};


const Nav = ({ toggleSidebar, toggleDarkMode, isDarkMode, onSearch, emp }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  useEffect(() => {
    const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
    allSideMenu.forEach(item => {
      const li = item.parentElement;
      item.addEventListener('click', function () {
        allSideMenu.forEach(i => {
          i.parentElement.classList.remove('active');
        });
        li.classList.add('active');
      });
    });

    const menuBar = document.querySelector('nav .bx.bx-menu');
    const sidebar = document.getElementById('sidebar');
    if (menuBar) {
      menuBar.addEventListener('click', function () {
        sidebar.classList.toggle('hide');
        document.querySelector('nav').classList.toggle('expanded');
      });
    }

    const searchButton = document.querySelector('nav form .form-input button');
    const searchButtonIcon = document.querySelector('nav form .form-input button .bx');
    const searchForm = document.querySelector('nav form');

    if (searchButton) {
      searchButton.addEventListener('click', function (e) {
        if (window.innerWidth < 576) {
          e.preventDefault();
          if (searchForm) {
            searchForm.classList.toggle('show');
            if (searchForm.classList.contains('show')) {
              searchButtonIcon.classList.replace('bx-search', 'bx-x');
            } else {
              searchButtonIcon.classList.replace('bx-x', 'bx-search');
            }
          }
        }
      });
    }

    if (window.innerWidth < 768) {
      sidebar.classList.add('hide');
    }

    const handleResize = () => {
      if (window.innerWidth > 576) {
        if (searchButtonIcon) {
          searchButtonIcon.classList.replace('bx-x', 'bx-search');
        }
        if (searchForm) {
          searchForm.classList.remove('show');
        }
      }
    };

    window.addEventListener('resize', handleResize);

    const switchMode = document.getElementById('switch-mode');
    if (switchMode) {
      switchMode.addEventListener('change', function () {
        if (this.checked) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      });
    }
    return () => {
      allSideMenu.forEach(item => {
        item.removeEventListener('click', () => {});
      });
      if (menuBar) {
        menuBar.removeEventListener('click', () => {});
      }
      if (searchButton) {
        searchButton.removeEventListener('click', () => {});
      }
      window.removeEventListener('resize', handleResize);
      if (switchMode) {
        switchMode.removeEventListener('change', () => {});
      }
    };
  }, []);
  const handleLogout = () => {
    secureLocalStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav>
      <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faBars} className="menuicon" />
      </button>
      <a href="/dashboard" className="nav-link"><b>Business</b></a>
      <form action="#">
        <div className="form-input">
          <input 
            type="search" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={handleSearchChange} 
            hidden
          />
          <button style={{display:"none"}} type="submit" className="search-btn" hidden>
            <FontAwesomeIcon icon={faSearch} hidden />
          </button>
        </div>
      </form>
      {/* <input
        type="checkbox"
        id="switch-mode"
        checked={isDarkMode}
        onChange={toggleDarkMode} 
        hidden />
      <label htmlFor="switch-mode" className="switch-mode" hidden ></label> */}
      <a href="#" className="notification" hidden>
        <FontAwesomeIcon icon={faBell} hidden />
        <span className="num">8</span>
      </a>
      {emp ? (
        <div
          className="profile"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ position: 'relative', display: 'flex', gap: '10px', alignItems: 'center' }}
        >
          <FontAwesomeIcon icon={faUser} style={{ cursor:"pointer", alignItems:"center" }} />
          <div className="emp_id">{emp}</div>
        </div>
      ) : (
        <a href="/" className="login-btn">Login</a>
        
      )}
      {emp && (
        <a onClick={handleLogout} className="logout" style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginLeft: "3px" , color:"red"}} />
        </a>
      )}
      
    </nav>
  );
};

export default Nav;

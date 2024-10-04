"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBell, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import './UI.css';

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

  return (
    <nav>
      <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faBars} className="menuicon" />
      </button>
      <a href="#" className="nav-link"><b>Business</b></a>
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
      <input
        type="checkbox"
        id="switch-mode"
        checked={isDarkMode}
        onChange={toggleDarkMode} 
        hidden
      />
      <label htmlFor="switch-mode" className="switch-mode"></label>
      <a href="#" className="notification" hidden>
        <FontAwesomeIcon icon={faBell} hidden />
        <span className="num">8</span>
      </a>
      {emp ? (
        <div
          className="profile"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ position: 'relative', display: 'inline-block' }}
        >
          <FontAwesomeIcon icon={faUser} style={{ cursor:"pointer" }} />
          {isHovered && (
              <div
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '50%',
                  transform: 'translateX(-100%)',
                  backgroundColor: '#fff',
                  padding: '10px',
                  borderRadius: '5px',
                  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                  zIndex: 100,
                  maxWidth: '200px',
                  width: 'fit-content', 
                  whiteSpace: 'nowrap', 
                }}
              >
                <div className="emp_id" style={{ fontWeight: 'bold' }}>Employee ID</div>
                <div className="emp_id">{emp}</div>
            </div>
          )}
        </div>
      ) : (
        <a href="/" className="login-btn">Login</a>
      )}
    </nav>
  );
};

export default Nav;

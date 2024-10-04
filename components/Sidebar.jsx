"use client";
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faTable,
  faColumns,
  faThList,
  faCog,
  faSignOutAlt,
  faShippingFast,  
  faAngleDown,
  faAngleRight,
  faAngleUp
} from "@fortawesome/free-solid-svg-icons";
import './UI.css';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [activeLink, setActiveLink] = useState("");
  const [isTablesOpen, setIsTablesOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const currentPath = window.location.pathname;
    setActiveLink(currentPath);
    
    const employeeId = localStorage.getItem("employeeId");
    setIsLoggedIn(!!employeeId);
  }, []);

  const handleLinkClick = (path, event) => {
    event.preventDefault(); 

    if (!isLoggedIn) {
      alert("Please login to access this page...");
      return;
    }

    setActiveLink(path);
    setIsCollapsed(true); 

    window.location.href = path;
  };

  const handleTablesClick = (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      alert("Please login to access this page...");
      return;
    }

    setIsTablesOpen(!isTablesOpen);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setIsCollapsed(true); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sidebarClass = isCollapsed ? "collapsed" : "expanded";
  const isSubmenuActive = ["/table", "/handsontable"].includes(activeLink);

  return (
    <section id="sidebar" className={sidebarClass} ref={sidebarRef}>
      <a href="/dashboard" className="brand">
        {!isCollapsed ? (
          <span
            style={{
              marginTop: "4px",
              marginLeft: "25px",
              fontSize: "30px",
              transition: "all 0.3s ease",
              display: "block",
            }}
          >
            𝗚𝗧𝗜{" "}
            <span
              style={{
                color: "green",
                fontSize: "20px",
                opacity: 1, 
                transition: "opacity 0.3s ease", 
                transitionDelay: "2s",
              }}
            >
              𝗢𝗻𝗹𝗶𝗻𝗲
            </span>
          </span>
        ) : (
          <span
            style={{
              marginTop: "2px",
              marginLeft: "2px",
              fontSize: "20px",
              fontFamily: "Arial, serif !important",
              transition: "all 0.3s ease",
              display: "block",
              textAlign: "center",
            }}
          >
            𝗚𝗧𝗜
          </span>
        )}
      </a>
      <ul className="side-menu top">
        <li className={activeLink === "/dashboard" ? "active" : ""}>
          <a href="/dashboard" onClick={(e) => handleLinkClick("/dashboard", e)}>
            <FontAwesomeIcon icon={faTachometerAlt} />
            {!isCollapsed && (
              <span style={{ marginLeft: "6px" }} className="text">
                <b>Dashboard</b>
              </span>
            )}
          </a>
        </li>
        <li className={activeLink === "/tables" || isSubmenuActive || isTablesOpen ? "active" : ""}>
          <a href="#" onClick={handleTablesClick} style={{ display: "flex", alignItems: "center" }}>
            <FontAwesomeIcon icon={faTable} />
            {!isCollapsed && (
              <>
                <span className="text" style={{ marginLeft: "6px" }}>
                  <b>Tables</b>
                </span>
                <FontAwesomeIcon
                  icon={isTablesOpen ? faAngleDown : faAngleRight}
                  style={{ marginLeft: "30px" }}
                />
              </>
            )}
          </a>
        </li>
        <ul
          className={`submenu ${isTablesOpen ? "open" : "collapsed"}`}
          style={{
            maxHeight: isTablesOpen ? "500px" : "0",
            transition: "max-height 0.3s ease-in-out, padding 0.3s ease-in-out",
            overflow: "hidden",
          }}
        >
          <li className={activeLink === "/table" ? "active" : ""}>
            <a href="/table" onClick={(e) => handleLinkClick("/table", e)}>
              <FontAwesomeIcon icon={faColumns} />
              {!isCollapsed && <span className="text"><b>JExcel</b></span>}
            </a>
          </li>
          <li className={activeLink === "/handsontable" ? "active" : ""}>
            <a href="/handsontable" onClick={(e) => handleLinkClick("/handsontable", e)}>
              <FontAwesomeIcon icon={faThList} />
              {!isCollapsed && <span className="text"><b>Handsontable</b></span>}
            </a>
          </li>
        </ul>
        <li className={activeLink === "/Shipping_plan" ? "active" : ""}>
          <a href="/Shipping_plan" onClick={(e) => handleLinkClick("/Shipping_plan", e)}>
            <FontAwesomeIcon icon={faShippingFast} /> 
            {!isCollapsed && (
              <span style={{ marginLeft: "2px" }} className="text">
                <b>Shipping Plan</b>
              </span>
            )}
          </a>
        </li>
      </ul>
      <ul className="side-menu down">
        <li className={activeLink === "/settings" ? "active" : ""}>
          <a href="/settings" onClick={(e) => handleLinkClick("/settings", e)}>
            <FontAwesomeIcon icon={faCog} />
            {!isCollapsed && (
              <span style={{ marginLeft: "6px" }} className="text">
                <b>Settings</b>
              </span>
            )}
          </a>
        </li>
        <li>
          <a onClick={handleLogout} className="logout" style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            {!isCollapsed && (
              <span style={{ marginLeft: "6px" }} className="text">
                <b>Logout</b>
              </span>
            )}
          </a>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;

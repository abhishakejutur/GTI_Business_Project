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
  faAngleDown,
  faAngleUp,
  faShippingFast
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
      alert("Please log in to access this page...");
      return;
    }

    setActiveLink(path);
    setIsCollapsed(true); 

    window.location.href = path;
  };

  const handleTablesClick = (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      alert("Please log in.");
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
      <a href="/" className="brand">
      <span className="text" style={{marginTop:"6px", marginLeft:"25px", fontSize:"30px"}}>GTI <span style={{color:"green", fontSize:"15px"}}>Online</span></span>
      </a>
      <ul className="side-menu top">
        <li className={activeLink === "/dashboard" ? "active" : ""}>
          <a href="/dashboard" onClick={(e) => handleLinkClick("/dashboard", e)}>
            <FontAwesomeIcon icon={faTachometerAlt} />
            {!isCollapsed && (
              <b><span style={{ marginLeft: "6px" }} className="text">
                Dashboard
              </span></b>
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
                  icon={isTablesOpen ? faAngleUp : faAngleDown}
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
            transition: "max-height 0.5s ease-in-out, padding 0.5s ease-in-out",
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
              <b><span style={{ marginLeft: "6px" }} className="text">
                Shipping Plan
              </span></b>
            )}
          </a>
        </li>
      </ul>
      <ul className="side-menu">
        <li className={activeLink === "/settings" ? "active" : ""}>
          <a href="/settings" onClick={(e) => handleLinkClick("/settings", e)}>
            <FontAwesomeIcon icon={faCog} />
            {!isCollapsed && (
              <b><span style={{ marginLeft: "6px" }} className="text">
                Settings
              </span></b>
            )}
          </a>
        </li>
        <li>
          <a onClick={handleLogout} className="logout" style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            {!isCollapsed && (
              <b><span style={{ marginLeft: "6px" }} className="text">
                Logout
              </span></b>
            )}
          </a>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;

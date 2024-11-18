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
  faAngleUp,
  faClipboardList,
  faMinusCircle 
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
              <span style={{ marginLeft: "5px", marginTop:"-1.5px" }} className="text">
                <p style={{fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Dashboard</p>
              </span>
            )}
          </a>
        </li>
        <li className={activeLink === "/Forecast" || isSubmenuActive || isTablesOpen ? "active" : ""} hidden>
          <a href="#" onClick={handleTablesClick} style={{ display: "flex", alignItems: "center" }}>
            <FontAwesomeIcon icon={faTable} />
            {!isCollapsed && (
              <>
                <span className="text" style={{ marginLeft: "6px" }}>
                  <p style={{fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Tables</p>
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
              {!isCollapsed && <span className="text"><p style={{fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>JExcel</p></span>}
            </a>
          </li>
          <li className={activeLink === "/handsontable" ? "active" : ""}>
            <a href="/handsontable" onClick={(e) => handleLinkClick("/handsontable", e)}>
              <FontAwesomeIcon icon={faThList} />
              {!isCollapsed && <span className="text"><p style={{fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Handsontable</p></span>}
            </a>
          </li>
        </ul>
        <li className={activeLink === "/Shipping_plan" ? "active" : ""}>
          <a href="/Shipping_plan" onClick={(e) => handleLinkClick("/Shipping_plan", e)}>
            <FontAwesomeIcon icon={faShippingFast} /> 
            {!isCollapsed && (
              <span style={{ marginLeft: "1.5px" }} className="text">
                <p style={{fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Shipping Plan</p>
              </span>
            )}
          </a>
        </li>
        <li className={activeLink === "/Forecast" ? "active" : ""}>
          <a href="/Forecast" onClick={(e) => handleLinkClick("/Forecast", e)}>
            <FontAwesomeIcon icon={faClipboardList} style={{ marginLeft: "4px"}} /> 
            {!isCollapsed && (
              <span style={{ marginLeft: "6px" }} className="text">
                <p style={{fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Forecast</p>
              </span>
            )}
          </a>
        </li>
        <li className={activeLink === "/exclude" ? "active" : ""}>
          <a href="/exclude" onClick={(e) => handleLinkClick("/exclude", e)}>
            <FontAwesomeIcon icon={faMinusCircle} style={{ marginLeft: "3px"}} /> 
            {!isCollapsed && (
              <span style={{ marginLeft: "3px" }} className="text">
                <p style={{fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Exclude</p>
              </span>
            )}
          </a>
        </li>
      </ul>
      <ul className="side-menu down">
        <li className={activeLink === "/settings" ? "active" : ""} hidden>
          <a href="/settings" onClick={(e) => handleLinkClick("/settings", e)}>
            <FontAwesomeIcon icon={faCog} style={{ marginLeft: "2px" }} />
            {!isCollapsed && (
              <span style={{ marginLeft: "5px" }} className="text">
                <p style={{fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Settings</p>
              </span>
            )}
          </a>
        </li>
        <li hidden>
          <a onClick={handleLogout} className="logout" style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginLeft: "3px" }} />
            {!isCollapsed && (
              <span style={{ marginLeft: "5px" }} className="text">
                <p style={{fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Logout</p>
              </span>
            )}
          </a>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;

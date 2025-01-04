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
  faMinusCircle,
  faCoins,
  faUniversalAccess,
} from "@fortawesome/free-solid-svg-icons";
import './UI.css';
import  secureLocalStorage  from  "react-secure-storage";


const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const [activeLink, setActiveLink] = useState("");
  const [isTablesOpen, setIsTablesOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardAccess, setDashboardAccess] = useState(false);
  const [dashboardCostAccess, setDashboardCostAccess] = useState(false);
  const [shippingScheduleAccess, setShippingScheduleAccess] = useState(false);
  const [ForecastAccess, setForecastAccess] = useState(false);
  const [excludeAccess, setExcludeAccess] = useState(false);
  const [partCosts, setPartCosts] = useState(false);
  const [pageAccess, setPageAccess] = useState([]);
  const [accessData, setAccessData] = useState([]);
  

  useEffect(() => {
    const currentPath = window.location.pathname;
    const empid = secureLocalStorage.getItem("die");
    setActiveLink(currentPath);
    fetchEmployeeAccess(empid);
    const employeeId = secureLocalStorage.getItem("die");
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

  const fetchEmployeeAccess = async (employeeId) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/getAccess?empId=${employeeId}`);
      const data = await response.json();
      console.log("Access data:", data);
      setAccessData(data);
      setPageAccess(data);
    } catch (error) {
      console.error("Error fetching employee access:", error);
    }
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
    secureLocalStorage.clear();
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

  const getAccessForPage = (pageName) => {
    const accessItem = accessData.find((item) => item.page === pageName);
    return accessItem ? accessItem.access : 0;
  };

  return (
    <section id="sidebar" className={sidebarClass} ref={sidebarRef}>
      <a style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",}}
      href="/dashboard" className="brand">
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
        <li hidden={getAccessForPage("Dashboard") === 0} className={activeLink === "/dashboard" ? "active" : ""}>
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
        <li hidden={getAccessForPage("ShippingSchedule") === 0} className={activeLink === "/Shipping_plan" ? "active" : ""}>
          <a href="/Shipping_plan" onClick={(e) => handleLinkClick("/Shipping_plan", e)}>
            <FontAwesomeIcon icon={faShippingFast} /> 
            {!isCollapsed && (
              <span style={{ marginLeft: "1.5px" }} className="text">
                <p style={{whiteSpace: "nowrap", fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Shipping Plan</p>
              </span>
            )}
          </a>
        </li>
        <li hidden={getAccessForPage("Forecast") === 0} className={activeLink === "/Forecast" ? "active" : ""}>
          <a href="/Forecast" onClick={(e) => handleLinkClick("/Forecast", e)}>
            <FontAwesomeIcon icon={faClipboardList} style={{ marginLeft: "4px"}} /> 
            {!isCollapsed && (
              <span style={{ marginLeft: "6px" }} className="text">
                <p style={{whiteSpace: "nowrap", fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Forecast</p>
              </span>
            )}
          </a>
        </li>
        <li hidden={getAccessForPage("Exclude") === 0} className={activeLink === "/exclude" ? "active" : ""}>
          <a href="/exclude" onClick={(e) => handleLinkClick("/exclude", e)}>
            <FontAwesomeIcon icon={faMinusCircle} style={{ marginLeft: "3px"}} /> 
            {!isCollapsed && (
              <span style={{ marginLeft: "3px" }} className="text">
                <p style={{whiteSpace: "nowrap", fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Exclude</p>
              </span>
            )}
          </a>
        </li>
        <li hidden={getAccessForPage("PartCosts") === 0 || getAccessForPage("PartCosts") === 1} className={activeLink === "/partcosts" ? "active" : ""}>
          <a href="/partcosts" onClick={(e) => handleLinkClick("/partcosts", e)}>
            <FontAwesomeIcon icon={faCoins} style={{ marginLeft: "3px"}} /> 
            {!isCollapsed && (
              <span style={{ marginLeft: "3px" }} className="text">
                <p style={{whiteSpace: "nowrap", fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Part Costs</p>
              </span>
            )}
          </a>
        </li>
      </ul>
      <ul className="side-menu down">
        <li hidden={getAccessForPage("AccessManagement") === 0} className={activeLink === "/access" ? "active" : ""} >
          <a href="/access" onClick={(e) => handleLinkClick("/access", e)}>
            <FontAwesomeIcon icon={faCog} style={{ marginLeft: "2px" }} />
            {!isCollapsed && (
              <span style={{ marginLeft: "5px" }} className="text">
                <p style={{whiteSpace: "nowrap", fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Access</p>
              </span>
            )}
          </a>
        </li>
        <li hidden>
          <a onClick={handleLogout} className="logout" style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{ marginLeft: "3px" }} />
            {!isCollapsed && (
              <span style={{ marginLeft: "5px" }} className="text">
                <p style={{whiteSpace: "nowrap", fontSize:"18px", fontFamily:"Poppins, sans-serif"}}>Logout</p>
              </span>
            )}
          </a>
        </li>
      </ul>
    </section>
  );
};

export default Sidebar;

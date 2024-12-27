"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './page.css';
import  secureLocalStorage  from  "react-secure-storage";
import { handleLogin } from "@/lib/auth";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Estimated Business");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [weekOptions, setWeekOptions] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedTonsForRow, setSelectedTonsForRow] = useState({});
  const [month, setMonth] = React.useState([]);
  const [newMonth, setNewMonth] = useState();
  const [newYear, setNewYear] = useState();
  const [defaultMonth, setDefaultMonth] = useState(null);
  const [defaultYear, setDefaultYear] = useState(null);
  const [dashboardAccess, setDashboardAccess] = useState(false);
  const [dashboardCostAccess, setDashboardCostAccess] = useState(false);
  const [saveButtonAccess, setSaveButtonAccess] = useState(false);
  const [accessData, setAccessData] = useState([]);
  const [access, setAccess] = useState();
  const [showMiddleTabs, setShowMiddleTabs] = useState(false);
  const [handleAccess, setHandleAccess] = useState(false);
  const [latestPlanWeek, setLatestPlanWeek] = useState();
  const [latestPlanYear, setLatestPlanYear] = useState();
  const [isLastFinalizeMonth, setIsLastFinalizeMonth] = useState();
  const [isLastFinalizeYear, setIsLastFinalizeYear] = useState();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1500);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const toggleMiddleTabs = () => {
    setShowMiddleTabs((prev) => !prev);
    if (showMiddleTabs) {
      setActiveTab("Estimated Business");
    }
  };
  useEffect(() => {
    const checkLogin = async () => {
      const employeeId = secureLocalStorage.getItem("nu");
      const id = secureLocalStorage.getItem("die");
      const password = secureLocalStorage.getItem("ep");
  
      if (!employeeId || !password || !id) {
        console.log("No credentials found, redirecting to login.");
        secureLocalStorage.clear();
        secureLocalStorage.clear();
        window.location.href = "/";
        return;
      }
      const isAccess = await handleLogin(id, password);
      if (!isAccess) {
        console.log("Access failed, redirecting to login.");
        secureLocalStorage.clear();
        secureLocalStorage.clear();
        window.location.href = "/";
      } else {
        console.log("accessing Dashboard...");
        await fetchEmployeeAccess(id);
        fetchCurrentMonthAndYear();
      }
    };
    checkLogin();
    const id = secureLocalStorage.getItem("die");
    fetchEmployeeAccess(id);
    fetchCurrentMonthAndYear();
    lastFinalizeWeek();
  }, []);

  // useEffect(() => {
  //   const employeeId = localStorage.getItem("username");
  //   const password = secureLocalStorage.getItem("password_encrypted");
  //   const empid = localStorage.getItem("employeeId");
  //   fetchEmployeeAccess(empid);
  //   if (!employeeId ) {
  //     window.location.href = "/";
  //     return;
  //   }
  //   handleLogin(employeeId, password);
  //   if(!handleAccess){
  //     window.location.href = "/";
  //   }
  //   fetchCurrentMonthAndYear();
  //   fetchEmployeeAccess(empid);
  // }, []);

  
  useEffect(() => {
    if (accessData.length > 0) {
      const accessLevel = getAccessForPage("Dashboard");
      setAccess(accessLevel);
      // setDashboardAccess(access===3)
      setDashboardCostAccess( access === 3 || access === 2 );
      console.log("access number : ", access, "access Level : ", accessLevel);
      console.log("access type : ",typeof(access))
      console.log("admin : ", access === 3);
      if (accessLevel === 0) {
        window.location.href = "/";
      }
    }
  }, [accessData]);
  const fetchEmployeeAccess = async (employeeId) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/getAccess?empId=${employeeId}`);
      const data = await response.json();
      setAccessData(data);
    } catch (error) {
      console.error("Error fetching employee access:", error);
    }
  };
  
  const getAccessForPage = (pageName) => {
    const accessItem = accessData.find((item) => item.page === pageName);
    return accessItem ? accessItem.access : 0;
  };
  useEffect(() => {
    if (activeTab === "Estimated Business") {
      fetchData();
      generateDynamicColumns(selectedDate);
    }
    if (activeTab === "Est. Busi. (Product)") {
      fetchDataByPartDesc();
      generateDynamicColumns(selectedDate);
    }
    if (activeTab === "Est. Busi. (Sale Type)") {
      fetchDataBySaleType();
      generateDynamicColumns(selectedDate);
    }
    if (activeTab === "Est. Busi. (Customer)") {
      fetchDataByCustomer();
      generateDynamicColumns(selectedDate);
    }
  }, [activeTab, selectedDate]);
  
  useEffect(() => {
    fetchWeekOptions();
    if (showMiddleTabs) {
      setActiveTab("Estimated Business");
    }
  }, []);

  // useEffect(() => {
  //   const initializePage = async () => {
  //     const today = new Date();
  //     const month = today.getMonth() + 1;
  //     const year = today.getFullYear();
  
  //     setDefaultMonth(month);
  //     setDefaultYear(year);
  //     setSelectedDate(new Date(year, month - 1, 1));
  
  //     // setColumnHeaders(generateMonthYearHeaders(month - 1, year));
  //     await fetchData(month, year);
  //     // await fetchSaveButtonStatus(month, year);
  //   };
  
  //   initializePage();
  // }, []);

  const fetchCurrentMonthAndYear = async () => {
    try {
      const response = await fetch(
        "http://10.40.20.93:300/customerForecast/getLatestMonthAndYear"
      );
      const data = await response.json();
      const { month_No, year_No } = data;
      const adjustedMonth = month_No - 1; 
      setIsLastFinalizeYear(year_No);
      setIsLastFinalizeMonth(month_No);
      setDefaultMonth(adjustedMonth);
      setDefaultYear(year_No);
      setNewMonth(month_No);
      setNewYear(year_No);

      let fmonth = month_No;
      let fyear = year_No;
      if(fmonth == 12){
        fmonth = 1;
        fyear = fyear + 1;
      } else {
        fmonth = fmonth + 1;
      }
      console.log("Check default fetching : ", fmonth, fyear, month_No, year_No);

      const defaultDate = new Date(fyear, fmonth - 1, 1);
      setSelectedDate(defaultDate);
      // setColumnHeaders(generateMonthYearHeaders(fmonth-1, fyear));
      
      // fetchData(fmonth, fyear);
      setSelectedDate(new Date(fyear, fmonth - 1, 1));
      fetchSaveButtonStatus(fmonth, fyear);

      setMonth(fmonth, fyear);
      fetchData();
    } catch (error) {
      console.error("Error fetching current month and year:", error);
    }
  };
  const fetchWeekOptions = async () => {
    try {
      const response = await fetch(`http://10.40.20.93:300/BTrail/weeks`);
      const data = await response.json();
      setWeekOptions(data);
      const currentWeekNumber = getCurrentWeekNumber();
      const defaultWeek = data.find(week => week.value.startsWith(`${currentWeekNumber}-`));
      if (defaultWeek) {
        setSelectedWeek(defaultWeek.value);
      }
    } catch (error) {
      console.error("Error fetching week options:", error);
    }
  };
  const fetchData = async () => {
    if (activeTab === "Estimated Business") {
      try {
        const response = await fetch(`http://10.40.20.93:300/dashboard?Month=${selectedDate.getMonth() + 1}&Year=${selectedDate.getFullYear()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        // console.log("Fetched data:", result);
        setTableData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setTableData([]);
    }
  };
  const fetchDataByPartDesc = async () => {
    if (activeTab === "Est. Busi. (Product)") {
      try {
        const response = await fetch(`http://10.40.20.93:300/dashboardEstProduct?Month=${selectedDate.getMonth() + 1}&Year=${selectedDate.getFullYear()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        // console.log("Fetched data:", result);
        setTableData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setTableData([]);
    }
  };
  const fetchDataBySaleType = async () => {
    if (activeTab === "Est. Busi. (Sale Type)") {
      try {
        const response = await fetch(`http://10.40.20.93:300/dashboardEstSaleType?Month=${selectedDate.getMonth() + 1}&Year=${selectedDate.getFullYear()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        // console.log("Fetched data:", result);
        setTableData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setTableData([]);
    }
  };
  const fetchDataByCustomer = async () => {
    if (activeTab === "Est. Busi. (Customer)") {
      try {
        const response = await fetch(`http://10.40.20.93:300/dashboardEstCustomer?Month=${selectedDate.getMonth() + 1}&Year=${selectedDate.getFullYear()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const result = await response.json();
        // console.log("Fetched data:", result);
        setTableData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setTableData([]);
    }
  };
  const lastFinalizeWeek = async () => {
    try {
      const response = await fetch('http://10.40.20.93:300/ShippingSchedule/getLatestPlanWeekAndYear', {
        method: 'GET'
        });
        if (response.ok) {
          const { month_No, year_No } = await response.json();
          setLatestPlanWeek(month_No);
          setLatestPlanYear(year_No);
        } else {
          console.error("Failed to fetch latest plan week and year");
        }
    } catch (error) {
          console.error("Error fetching latest plan week and year:", error);
      }
  };
  const handleWeekChange = (e) => {
    const selectedValue = e.target.value;
    const [week, year] = selectedValue.split('-');
    const weekNo = parseInt(week);
    const yearNo = parseInt(year);
    let Cweek = weekNo;
    let Cyear = yearNo;
    if(Cweek == 1){
      Cweek = 52;
      Cyear = Cyear - 1;
    } else {
      Cweek = Cweek - 1;
    }
    console.log("Check plans : ",Cweek, Cyear, latestPlanWeek, latestPlanYear);
    console.log("Selected week:", weekNo, typeof(weekNo));
    console.log("Selected year:", yearNo);
    console.log("Last finalized week:", latestPlanWeek);
    if(Cweek>latestPlanWeek || Cyear>latestPlanYear){
      setSelectedWeek(week);
      alert("Not finalized the previous week plan");
    } else {
      setSelectedWeek(week);
      setSelectedYear(year);
      console.log("Selected week:", week);
      console.log("Selected year:", year);
      fetchShippingScheduleData(week, year);
    }
  };
  const fetchShippingScheduleData = async (week, year) => {
    const weekNo = parseInt(week);
    const yearNo = parseInt(year);
    let Cweek = weekNo;
    let Cyear = yearNo;
    if(Cweek == 1){
      Cweek = 52;
      Cyear = Cyear - 1;
    } else {
      Cweek = Cweek - 1;
    }
    console.log("Check fetch plans : ",Cweek, Cyear, latestPlanWeek, latestPlanYear);
    console.log("Selected week:", weekNo, typeof(weekNo));
    console.log("Selected year:", yearNo);
    console.log("Last finalized week:", latestPlanWeek, typeof(latestPlanWeek));
    if(Cweek>latestPlanWeek || Cyear>latestPlanYear){
      setSelectedWeek('');
      alert("Not finalized the previous week plan");
      return;
    }
    try {
      const response = await fetch(`http://10.40.20.93:300/dashboard/shippingschedule?PlanWeek=${week}&PlanYear=${year}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      console.log("Fetched shipping schedule data:", result);
      setTableData(result);
    } catch (error) {
      console.log( "Selected week:", week);
      console.log( "Selected year:", year);
      console.error("Error fetching shipping schedule data:", error);
    }
  };
  const handleSaveShippingSchedule = async () => {
    if (!selectedWeek || !selectedYear) {
      alert("Please select a valid week and year.");
      return;
    }
    try {
      const containerWeights = tableData.map((row, index) => ({
        CustLocation: row.custLocation,
        Customer: row.customer,
        Week_no: row.week_no,
        SaleType: row.saletype,
        ContainerWeight: selectedTonsForRow[index] || row.containerWeight || 0
      }));
      const apiUrl = `http://10.40.20.93:300/dashboard/shippingschedule/save?PlanWeek=${selectedWeek}&PlanYear=${selectedYear}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(containerWeights),
      });
      if (!response.ok) {
        throw new Error('Failed to save shipping schedule data.');
      }
      alert('Shipping schedule saved successfully.');
    } catch (error) {
      console.error("Error saving shipping schedule:", error);
      alert('Failed to save shipping schedule.');
    }
  };
  const generateDynamicColumns = (startDate) => {
    const months = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 0; i < 12; i++) {
        const monthIndex = (startDate.getMonth() + i) % 12;
        const year = startDate.getFullYear() + Math.floor((startDate.getMonth() + i) / 12);
        months.push(`${monthNames[monthIndex]} ${String(year).slice(-2)}`);
    }
    setColumns(months);
  };
  const handleDateChange = (date) => {
    let month = date.getMonth()+1;
    let year = date.getFullYear();
    let Cmonth = month; 
    let Cyear = year;
    if(Cmonth==1){
      Cmonth=12;
      Cyear=Cyear-1;
    }else{
      Cmonth=Cmonth-1;
    }
    console.log("Checking change : Month:", Cmonth, "Year:", Cyear);
    if(Cmonth>isLastFinalizeMonth || Cyear>isLastFinalizeYear){
      console.log("last finalize month and year", isLastFinalizeMonth, isLastFinalizeYear);
      alert("Please finalize previous month");
    } else {
      setSelectedDate(date);
    }
    
  };
  const initializeShippingScheduleData = () => {
    lastFinalizeWeek();
    const currentWeek = getCurrentWeekNumber();
    const currentYear = new Date().getFullYear();
    // const currentWeek = latestPlanWeek;
    // const currentYear = latestPlanYear;
    setSelectedWeek(currentWeek);
    setSelectedYear(currentYear);
    fetchShippingScheduleData(currentWeek, currentYear);
  };
  // const handleTabChange = (tab) => {
  //   setActiveTab(tab);
  //   if (tab === "Estimate Shipping Schedule") {
  //     initializeShippingScheduleData();
  //     setColumns([]);
  //   } else {
  //     generateDynamicColumns(selectedDate);
  //   }
  // };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  
    if (tab === "Estimated Business") {
      generateDynamicColumns(selectedDate);
      fetchData();
    } else if (tab === "Est. Busi. (Product)") {
      generateDynamicColumns(selectedDate);
      fetchDataByPartDesc();
    } else if (tab === "Est. Busi. (Sale Type)") {
      generateDynamicColumns(selectedDate);
      fetchDataBySaleType();
    } else if (tab === "Est. Busi. (Customer)") {
      generateDynamicColumns(selectedDate);
      fetchDataByCustomer();
    } else if (tab === "Estimate Shipping Schedule") {
      setShowMiddleTabs(false);
      initializeShippingScheduleData();
      setColumns([]);
    }
  };
  
  
  const formatNumber = (num) => {
    const parsedNum = parseFloat(num);
    // console.log("Formatting number:", num, "=>", parsedNum); 
    if (!isNaN(parsedNum)) {
      return parsedNum.toLocaleString('en-US');
    }
    return "0";
  };
  const getRowBackgroundColorProduct = (index) => {
    if (tableData.length === 16) {
      if ((index + 1) % 4 === 0) {
        return { backgroundColor: '#FFE7C7' };
      } else if (index % 4 === 0) {
        return { backgroundColor: '#CAF1DE' };
      } else if ((index - 1) % 4 === 0) {
        return { backgroundColor: '#E1F8DC' };
      } else {
        return { backgroundColor: '#FEF8DD' };
      }
    }
  };
  const getRowBackgroundColor = (index) => {
    if (tableData.length === 19) {
      if ((index + 1) % 3 === 0) {
        return { backgroundColor: '#FFE7C7' };
      } else if (index % 3 === 0) {
        return { backgroundColor: '#CAF1DE' };
      } else if ((index - 1) % 3 === 0) {
        return { backgroundColor: '#E1F8DC' };
      }
  
    } else {
      if ((index + 1) % 4 === 0) {
        return { backgroundColor: '#FFE7C7' };
      } else if (index % 4 === 0) {
        return { backgroundColor: '#CAF1DE' };
      } else if ((index - 1) % 4 === 0) {
        return { backgroundColor: '#E1F8DC' };
      } else {
        return { backgroundColor: '#FEF8DD' };
      }
    }
  };

  const getRowBackgroundColorSaleType = (index) => {
    if (tableData.length === 8) {
      if ((index + 1) % 4 === 0) {
        return { backgroundColor: '#FFE7C7' };
      } else if (index % 4 === 0) {
        return { backgroundColor: '#CAF1DE' };
      } else if ((index - 1) % 4 === 0) {
        return { backgroundColor: '#E1F8DC' };
      } else {
        return { backgroundColor: '#FEF8DD' };
      }
  
    } else {
      if ((index + 1) % 5 === 0) {
        return { backgroundColor: '#FFE7C7' };
      } else if (index % 5 === 0) {
        return { backgroundColor: '#CAF1DE' };
      } else if (index % 5 === 0) {
        return { backgroundColor: '#E1F8DC' };
      } else if ((index - 1) % 5 === 0) {
        return { backgroundColor: '#FEF8DD' };
      } else {
        return { backgroundColor: '#FFE7C7' };
      }
    }
  };

  // const getRowBackgroundColor = (index) => {
  //   if ((index + 1) % 4 === 0) {
  //     return { backgroundColor: '#D3D3D3', borderBottom: '2px solid white' };
  //   } else if (index % 4 === 0) {
  //     return { backgroundColor: '#b1bed5' };
  //   } else if ((index - 1) % 4 === 0) {
  //     return { backgroundColor: '#bfd8d5' };
  //   } else {
  //     return { backgroundColor: '#cce5ff' };
  //   }
  // };
  
  const getRowBackgroundColorTab3 = (index) => {
    const baseStyle = index % 12 < 6 
      ? { backgroundColor: '#CCFFCC', borderBottom: '1px solid white' } 
      : { backgroundColor: '#E6FFEB', borderBottom: '1px solid white' };
    if ((index + 1) % 6 === 0) {
      return { ...baseStyle, borderBottom: '3px solid white' };
    }
    return baseStyle;
  };
  const getRowBackgroundColorTab2 = (index) => {
    const colors = [
      '#ACDDDE',
      '#CAF1DE',
      '#E1F8DC',
      '#FEF8DD',
      '#FFE7C7',
      '#F7D8BA'
    ];
    const rowStyle = { backgroundColor: colors[index % colors.length] };
    if ((index + 1) % 6 === 0) {
        rowStyle.borderBottom = '2px solid white';
    }
    return rowStyle;
  };
  const getCurrentWeekNumber = () => {
    const date = new Date();
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);
    return weekNumber;
  };
  const calculateEstimatedTrucks = (shipWeight, containerCapacity, saleType) => {
    if (shipWeight < 10000 && saleType === "EXP") {
      return "LCL";
    }
    if (containerCapacity > 0) {
      return (shipWeight / (containerCapacity * 1000)).toFixed(1);
    }
    return 0.0;
  };
  
  return (
    <div className="container" style={{ maxWidth: '100%', padding: '20px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div
        className="tab-container"
        style={{
          display: 'flex',
          borderBottom: '1px solid #ddd',
          marginTop: '10px',
          marginBottom: '1px',
          position: 'relative',
        }}
      >
        {/* First Tab */}
        <button
          className={`tab-button ${activeTab === "Estimated Business" ? "active" : ""}`}
          onClick={() => handleTabChange("Estimated Business")}
          style={{
            fontSize: "12px",
            padding: "10px 5px",
            fontWeight: "bold",
            backgroundColor: activeTab === "Estimated Business" ? "#007bff" : "white",
            color: activeTab === "Estimated Business" ? "#fff" : "#000",
            borderTopLeftRadius: "8px",
          }}
        >
          <span style={{ marginLeft:"10px"}}>Estimated Business</span>
        </button>
        
        {/* Toggle Button */}
        <button
          className="toggle-button"
          disabled = {activeTab === "Estimate Shipping Schedule"}
          onClick={toggleMiddleTabs}
          style={{
            fontSize: "12px",
            padding: "10px -10px",
            fontWeight: "bold",
            backgroundColor: "#fff",
            cursor: activeTab === "Estimate Shipping Schedule" ? "not-allowed" : "pointer",
            color:"white",
            backgroundColor: activeTab === "Estimated Business" ? "#007bff" : "white",
            cursor: "pointer",
            transition: "transform 0.3s",
          }}
        >
          <span
          style={{
            fontSize: "12px",
            padding: "2px 8px",
            fontWeight: "bold",
            backgroundColor: "#fff",
            color: activeTab === "Estimated Business" || activeTab === "Est. Busi. (Product)" ? "white" : "#007bff",
            backgroundColor: activeTab === "Estimated Business" || activeTab === "Est. Busi. (Product)" ? "#007bff" : "white",
            borderRadius:"80%",
            border:activeTab === "Estimated Business" || activeTab === "Est. Busi. (Product)" ? "1px solid #ddd" : "1px solid #ddd",
            cursor: "pointer",
            transition: "transform 0.3s",
            display: "inline-block",
            transition: "transform 0.3s ease",
            transform: showMiddleTabs ? "rotate(180deg)" : "rotate(0deg)", 
          }}
        >
          &gt;
        </span>
        </button>
        
        {/* Middle Tabs */}
        <div
          className={`middle-tabs`}
          style={{
            display: "flex",
            overflow: "hidden",
            transition: "max-width 0.6s ease",
            maxWidth: showMiddleTabs ? "400px" : "0px",
            opacity: showMiddleTabs ? "1" : "0",
            whiteSpace: "nowrap",
            marginLeft: "-12px",
          }}
        >
          <button
            hidden={!showMiddleTabs}
            onClick={() => handleTabChange("Est. Busi. (Product)")}
            style={{
              fontSize: "12px",
              padding: "10px 10px",
              fontWeight: "bold",
              backgroundColor: activeTab === "Est. Busi. (Product)" ? "#007bff" : "#F5F5F5",
              color: activeTab === "Est. Busi. (Product)" ? "#fff" : "#000",
              borderLeft: "1px solid #ddd",
              // borderRight: "1px solid #ddd",
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis",
              // transition: "opacity 0.6s ease",
            }}
          >
            <span style={{paddingLeft:"5px"}}>Product Wise</span>
          </button>
          <button
            hidden={!showMiddleTabs}
            onClick={() => handleTabChange("Est. Busi. (Sale Type)")}
            style={{
              fontSize: "12px",
              padding: "10px 10px",
              fontWeight: "bold",
              backgroundColor: activeTab === "Est. Busi. (Sale Type)" ? "#007bff" : "#F5F5F5",
              color: activeTab === "Est. Busi. (Sale Type)" ? "#fff" : "#000",
              borderLeft: "1px solid #ddd",
              borderRight: "0px solid #ddd",
              transition: "opacity 0.3s ease",
              transition: "max-width 0.6s ease, opacity 0.6s ease",
              whiteSpace: "nowrap", 
              overflow: "hidden",   
              textOverflow: "ellipsis",
              transition: "opacity 0.6s ease",
            }}
          >
            Sale Type Wise
          </button>
          <button
            hidden={!showMiddleTabs}
            className="button-hover"
            onClick={() => handleTabChange("Est. Busi. (Customer)")}
            style={{
              fontSize: "12px",
              padding: "10px 10px",
              fontWeight: "bold",
              backgroundColor: activeTab === "Est. Busi. (Customer)" ? "#007bff" : "#F5F5F5",
              color: activeTab === "Est. Busi. (Customer)" ? "#fff" : "#000",
              borderLeft: "1px solid #ddd",
              borderRight: "0px solid #ddd",
              transition: "opacity 0.3s ease",
              transition: "max-width 0.6s ease, opacity 0.6s ease",
              whiteSpace: "nowrap", 
              overflow: "hidden",   
              textOverflow: "ellipsis",
              transition: "opacity 0.6s ease",
            }}
          >
            Customer Wise
          </button>
        </div>
          
        {/* Last Tab */}
        <button
          className={`tab-button ${activeTab === "Estimate Shipping Schedule" ? "active" : ""}`}
          onClick={() => handleTabChange("Estimate Shipping Schedule")}
          style={{
            fontSize: "12px",
            padding: "10px 10px",
            fontWeight: "bold",
            backgroundColor: activeTab === "Estimate Shipping Schedule" ? "#007bff" : "white",
            color: activeTab === "Estimate Shipping Schedule" ? "#fff" : "#000",
            borderTopRightRadius: "8px",
            borderLeft: "1px solid #ddd",
            marginLeft: showMiddleTabs ? "0" : "0px",
            transition: "margin-left 0.6s ease",
          }}
        >
          <span style={{paddingLeft:"5px", paddingRight:"5px"}}>Shipping Schedule</span>
        </button>
      </div>
      <div className="header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}></h1>
        {activeTab === "Estimate Shipping Schedule" ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={`${selectedWeek}-${selectedYear}`}
              onChange={handleWeekChange}
              style={{ padding: '5px', fontSize: '16px', borderRadius: '5px', border: '1px solid #333', backgroundColor: 'transparent', cursor: "pointer", padding: "5px 10px", textAlign:"center", marginRight:"20px" }}
            >
              <option style={{ textAlign: "left" }} value="">Select Week</option>
              {weekOptions.map((week) => (
                <option style={{ textAlign: "left" }} key={week.value} value={week.value}>
                  {week.value}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleSaveShippingSchedule()}
              hidden = {access!==3}
              style={{
                padding: '8px 16px',
                marginRight: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#218838')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
            >
              Save
            </button>
          </div>
        ) : (
          <div className="datepicker-container" style={{ position: 'relative', display: 'inline-block' }}>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              className="calendar-input styled-datepicker"
              placeholderText="Select Month/Year"
              popperPlacement="bottom"
            />
          </div>
        )}
      </div>
      </div>
      <div className="content-container" style={{ padding: '10px', background: '#fff', borderRadius: '8px', borderTopLeftRadius: '0px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginTop: '-1px', maxHeight: '100vh', overflowX: 'hidden', overflowY: 'hidden' }}>
        <div className="table-container" style={{ overflowY: 'auto', maxHeight: '70vh', borderRadius: '8px', borderTopLeftRadius: '8px' }}>
          {activeTab === "Estimated Business" && (
            <table className="min-w-full table-auto border-collapse" style={{ tableLayout: 'fixed', width: '100%', borderRadius: '8px', wordWrap:"break-word" }}>
              <thead className="sticky top-0 bg-gray-300" style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                <tr className="sticky top-0 bg-gray-300" style={{ fontSize: '13px', zIndex: 1, padding: '8px' }}>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', width: '150px' }}>Months</th>
                  {columns.map((col, index) => (
                    <th key={index} className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', minWidth: '100px', textAlign: 'center', padding: '8px' }}>{col}</th>
                  ))}
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', width: '90px', fontSize:"13px", padding: '8px' }}>Average</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData
                  .filter((row, index) => {
                    if (row.required_Weights === "Cost" && !dashboardCostAccess) {
                      return false;
                    }
                    return true;
                  }).map((row, index) => {
                    const isFourthRow = (index + 1) % 4 === 0 && index !== tableData.length - 1;
                    const monthValues = columns.map((col, i) => row[String.fromCharCode(97 + i)] || 0);
                    const average = Math.round(monthValues.reduce((sum, val) => sum + val, 0) / monthValues.length);
                    const isLastRow = index === tableData.length - 1;
                    const isThirdVisibleRow1 = (index + 1) % 3 === 0;
                    const isThirdVisibleRow = !dashboardCostAccess && row.required_Weights !== "Cost" && (index + 1) % 3 === 0;
                    const isFinalGTIPlan = row.material === "Final GTI Plan";
                    const isCostRow = row.required_Weights === "Cost";
                    const isqtyrow = row.required_Weights === "Qty.";
                    const isWeightRow = row.required_Weights === "Kgs.";
                    const isTonsRow = row.required_Weights === "Tons";
                    if (isLastRow || isFinalGTIPlan) {
                      return null;
                    }
                    const rowStyle = {
                      ...getRowBackgroundColor(index),
                      fontFamily: "calibri",
                      fontSize: '13px',
                      ...(isThirdVisibleRow ? { borderBottom: "2px solid white" } : {}),
                      // ...(isLastRow || isFinalGTIPlan ? { backgroundColor: "#a6f1a6", color: "black" } : {}),
                      ...(isCostRow ? { borderBottom: "2px solid white", backgroundColor: "#FFE7C7", color: "black" } : {}),
                      ...(isqtyrow && tableData.length!==25 ? { borderBottom: "2px solid white"} : {}),
                      ...(isqtyrow && !isFinalGTIPlan ? { backgroundColor: "#FEF8DD", color: "black" } : {}),
                      ...(isWeightRow && !isFinalGTIPlan ? { backgroundColor: "#E1F8DC", color: "black" } : {}),
                      ...(isTonsRow && !isFinalGTIPlan ? { backgroundColor: "#CAF1DE", color: "black" } : {}),
                      
                    };
                    return (
                      <tr key={index} style={rowStyle}>
                        <td className="border px-2 py-1" style={{ textAlign: 'left' }}>
                          {row.material} <span style={{ float: 'right', fontWeight: 'normal' }}>{row.required_Weights}</span>
                        </td>
                        {columns.map((col, i) => {
                          const key = String.fromCharCode(97 + i);
                          return (
                            <td id="cell" key={i} className="border px-1 py-1" style={{ textAlign: 'right', fontSize: '12px' }}>
                              {row[key] ? formatNumber(row[key]) : ""}
                            </td>
                          );
                        })}
                        <td className="border px-2 py-1" style={{ width: '60px', textAlign: 'right', fontSize: '12px' }}>
                          {formatNumber(average)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="border px-4 py-2 text-center">No Data Available</td>
                  </tr>
              )}
              </tbody>
            </table>
          )}    
          {activeTab === "Est. Busi. (Product)" && (
            <table className="min-w-full table-auto border-collapse" style={{ tableLayout: 'fixed', width: '100%', borderRadius: '8px', wordWrap:"break-word" }}>
              <thead className="sticky top-0 bg-gray-300" style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                <tr className="sticky top-0 bg-gray-300" style={{ fontSize: '13px', zIndex: 1, padding: '8px' }}>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', width: '170px' }}>Months</th>
                  {columns.map((col, index) => (
                    <th key={index} className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', minWidth: '80px', textAlign: 'center', padding: '8px' }}>{col}</th>
                  ))}
                  <th hidden className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', width: '100px', fontSize:"13px", padding: '8px' }}>Average</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData
                  .filter((row, index) => {
                    if (row.required_Weights === "Cost" && !dashboardCostAccess) {
                      return false;
                    }
                    return true;
                  }).map((row, index) => {
                    const isFourthRow = (index + 1) % 4 === 0 && index !== tableData.length - 1;
                    const monthValues = columns.map((col, i) => row[String.fromCharCode(97 + i)] || 0);
                    const average = Math.round(monthValues.reduce((sum, val) => sum + val, 0) / monthValues.length);
                    const isLastRow = index === tableData.length - 1;
                    const isThirdVisibleRow1 = (index + 1) % 3 === 0;
                    const isThirdVisibleRow = !dashboardCostAccess && row.required_Weights !== "Cost" && (index + 1) % 3 === 0;
                    const isFinalGTIPlan = row.material === "Final GTI Plan";
                    const isCostRow = row.required_Weights === "Cost";
                    const isqtyrow = row.required_Weights === "Qty.";
                    const isWeightRow = row.required_Weights === "Kgs.";
                    const isTonsRow = row.required_Weights === "Tons";
                    
                    const rowStyle = {
                      ...getRowBackgroundColorProduct(index),
                      fontFamily: "calibri",
                      fontSize: '13px',
                      ...(isThirdVisibleRow ? { borderBottom: "2px solid white" } : {}),
                      // ...(isLastRow || isFinalGTIPlan ? { backgroundColor: "#a6f1a6", color: "black" } : {}),
                      ...(isCostRow ? { borderBottom: "2px solid white", backgroundColor: "#FFE7C7", color: "black" } : {}),
                      ...(isqtyrow && tableData.length!==16 ? { borderBottom: "2px solid white"} : {}),
                      ...(isqtyrow && !isFinalGTIPlan ? { backgroundColor: "#FEF8DD", color: "black" } : {}),
                      ...(isWeightRow && !isFinalGTIPlan ? { backgroundColor: "#E1F8DC", color: "black" } : {}),
                      ...(isTonsRow && !isFinalGTIPlan ? { backgroundColor: "#CAF1DE", color: "black" } : {}),
                      
                    };
                    return (
                      <tr key={index} style={rowStyle}>
                        <td className="border px-2 py-1" style={{ textAlign: 'left' }}>
                          {row.material} <span style={{ float: 'right', fontWeight: 'normal' }}>{row.required_Weights}</span>
                        </td>
                        {columns.map((col, i) => {
                          const key = String.fromCharCode(97 + i);
                          return (
                            <td key={i} className="border px-1 py-1" style={{ textAlign: 'right', fontSize: '12px' }}>
                              {row[key] ? formatNumber(row[key]) : ""}
                            </td>
                          );
                        })}
                        <td hidden className="border px-2 py-1" style={{ width: '100px', textAlign: 'right', fontSize: '12px' }}>
                          {formatNumber(average)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="border px-4 py-2 text-center">No Data Available</td>
                  </tr>
              )}
              </tbody>
            </table>
          )}    
          {activeTab === "Est. Busi. (Sale Type)" && (
            <table className="min-w-full table-auto border-collapse" style={{ tableLayout: 'fixed', width: '100%', borderRadius: '8px', wordWrap:"break-word" }}>
              <thead className="sticky top-0 bg-gray-300" style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                <tr className="sticky top-0 bg-gray-300" style={{ fontSize: '13px', zIndex: 1, padding: '8px' }}>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', width: '160px' }}>Months</th>
                  {columns.map((col, index) => (
                    <th key={index} className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', minWidth: '80px', textAlign: 'center', padding: '8px' }}>{col}</th>
                  ))}
                  <th hidden className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', width: '100px', fontSize:"13px", padding: '8px' }}>Average</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData
                  .filter((row, index) => {
                    if (row.required_Weights === "Cost" && !dashboardCostAccess) {
                      return false;
                    }
                    return true;
                  }).map((row, index) => {
                    const isFourthRow = (index + 1) % 4 === 0 && index !== tableData.length - 1;
                    const monthValues = columns.map((col, i) => row[String.fromCharCode(97 + i)] || 0);
                    const average = Math.round(monthValues.reduce((sum, val) => sum + val, 0) / monthValues.length);
                    const isLastRow = index === tableData.length - 1;
                    const isThirdVisibleRow1 = (index + 1) % 3 === 0;
                    const isThirdVisibleRow = !dashboardCostAccess && row.required_Weights !== "Cost" && (index + 1) % 4 === 0;
                    const isFinalGTIPlan = row.material === "Final GTI Plan";
                    const isCostRow = row.required_Weights === "Share %";
                    const isqtyrow = row.required_Weights === "Qty.";
                    const isWeightRow = row.required_Weights === "Kgs.";
                    const isTonsRow = row.required_Weights === "Tons";
                    
                    const rowStyle = {
                      ...getRowBackgroundColorSaleType(index),
                      fontFamily: "calibri",
                      fontSize: '13px',
                      ...(isThirdVisibleRow ? { borderBottom: "2px solid white" } : {}),
                      ...(isLastRow || isFinalGTIPlan ? { backgroundColor: "#a6f1a6", color: "black" } : {}),
                      ...(isCostRow ? { borderBottom: "2px solid white", backgroundColor: "#F7D8BA", color: "black" } : {}),
                      // ...(isqtyrow && tableData.length!==10 ? { borderBottom: "2px solid white"} : {}),
                      ...(isqtyrow && !isFinalGTIPlan ? { backgroundColor: "#FEF8DD", color: "black" } : {}),
                      ...(isWeightRow && !isFinalGTIPlan ? { backgroundColor: "#E1F8DC", color: "black" } : {}),
                      ...(isTonsRow && !isFinalGTIPlan ? { backgroundColor: "#CAF1DE", color: "black" } : {}),
                      
                    };
                    return (
                      <tr key={index} style={rowStyle}>
                        <td className="border px-2 py-1" style={{ textAlign: 'left' }}>
                          {row.material} <span style={{ float: 'right', fontWeight: 'normal' }}>{row.required_Weights}</span>
                        </td>
                        {columns.map((col, i) => {
                          const key = String.fromCharCode(97 + i);
                          return (
                            <td key={i} className="border px-1 py-1" style={{ textAlign: 'right', fontSize: '12px' }}>
                              {row.required_Weights === "Share %" ? 
                                formatNumber(row[key]) : 
                                (row[key] ? formatNumber(Math.round(row[key], 0)) : "")
                              }
                            </td>
                          );
                        })}
                        <td hidden className="border px-2 py-1" style={{ width: '100px', textAlign: 'right', fontSize: '12px' }}>
                          {formatNumber(average)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="border px-4 py-2 text-center">No Data Available</td>
                  </tr>
              )}
              </tbody>
            </table>
          )}    
          {activeTab === "Est. Busi. (Customer)" && (
            <table className="min-w-full table-auto border-collapse" style={{ tableLayout: 'fixed', width: '100%', borderRadius: '8px', wordWrap:"break-word" }}>
              <thead className="sticky top-0 bg-gray-300" style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                <tr className="sticky top-0 bg-gray-300" style={{ fontSize: '13px', zIndex: 1, padding: '8px' }}>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', width: '160px' }}>Months</th>
                  {columns.map((col, index) => (
                    <th key={index} className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', minWidth: '80px', textAlign: 'center', padding: '8px' }}>{col}</th>
                  ))}
                  <th hidden className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', width: '100px', fontSize:"13px", padding: '8px' }}>Average</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData
                  .filter((row, index) => {
                    if (row.required_Weights === "Cost" && !dashboardCostAccess) {
                      return false;
                    }
                    return true;
                  }).map((row, index) => {
                    const isFourthRow = (index + 1) % 4 === 0 && index !== tableData.length - 1;
                    const monthValues = columns.map((col, i) => row[String.fromCharCode(97 + i)] || 0);
                    const average = Math.round(monthValues.reduce((sum, val) => sum + val, 0) / monthValues.length);
                    const isLastRow = index === tableData.length - 1;
                    const isThirdVisibleRow1 = (index + 1) % 3 === 0;
                    const isThirdVisibleRow = !dashboardCostAccess && row.required_Weights !== "Cost" && (index + 1) % 3 === 0;
                    const isFinalGTIPlan = row.material === "Final GTI Plan";
                    const isCostRow = row.required_Weights === "Share %";
                    const isqtyrow = row.required_Weights === "Qty.";
                    const isWeightRow = row.required_Weights === "Kgs.";
                    const isTonsRow = row.required_Weights === "Tons";
                    
                    const rowStyle = {
                      ...getRowBackgroundColorSaleType(index),
                      fontFamily: "calibri",
                      fontSize: '13px',
                      // ...(isThirdVisibleRow ? { borderBottom: "2px solid white" } : {}),
                      // ...(isLastRow || isFinalGTIPlan ? { backgroundColor: "#a6f1a6", color: "black" } : {}),
                      ...(isCostRow ? { borderBottom: "2px solid white", backgroundColor: "#F7D8BA", color: "black" } : {}),
                      // ...(isqtyrow && tableData.length!==25 ? { borderBottom: "2px solid white"} : {}),
                      ...(isqtyrow && !isFinalGTIPlan ? { backgroundColor: "#FEF8DD", color: "black" } : {}),
                      ...(isWeightRow && !isFinalGTIPlan ? { backgroundColor: "#E1F8DC", color: "black" } : {}),
                      ...(isTonsRow && !isFinalGTIPlan ? { backgroundColor: "#CAF1DE", color: "black" } : {}),
                      
                    };
                    return (
                      <tr key={index} style={rowStyle}>
                        <td className="border px-2 py-1" style={{ textAlign: 'left' }}>
                          {isTonsRow && row.material} <span style={{ float: 'right', fontWeight: 'normal' }}>{row.required_Weights}</span>
                        </td>
                        {columns.map((col, i) => {
                          const key = String.fromCharCode(97 + i);
                          return (
                            <td key={i} className="border px-1 py-1" style={{ textAlign: 'right', fontSize: '12px' }}>
                              {row.required_Weights === "Share %" ? 
                                formatNumber(row[key]) : 
                                (row[key] ? formatNumber(Math.round(row[key], 0)) : "")
                              }
                            </td>
                          );
                        })}
                        <td hidden className="border px-2 py-1" style={{ width: '100px', textAlign: 'right', fontSize: '12px' }}>
                          {formatNumber(average)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="border px-4 py-2 text-center">No Data Available</td>
                  </tr>
              )}
              </tbody>
            </table>
          )}    
          {activeTab === "Estimate Shipping Schedule" && (
            <table className="min-w-full table-auto border-collapse"> 
              <thead className="sticky top-0 bg-gray-300" style={{ position: 'sticky', top: '0', zIndex: '1' }}>
                <tr className="sticky top-0 bg-gray-300" style={{ fontSize: '13px', zIndex: 1, padding: '10px' }}>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Customer</th>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Location</th>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Week</th>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Parts Count</th>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Box Count</th>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Shipment Net Weight (Kgs.)</th>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Cast Gross Weight (Kgs.)</th>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Ship Gross Weight (Kgs.)</th>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Container Capacity (Tons)</th>
                  <th className="border px-1 py-1" style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }}>Est. Truck(s)</th>
                </tr>
              </thead>
              <tbody style={{ padding: "8px" }}>
              {tableData.length > 0 ? (
                tableData.map((row, index) => {
                  const containerWeight = selectedTonsForRow[index]
                    ? parseFloat(selectedTonsForRow[index])
                    : row.containerWeight || (row.saletype === "EXP" ? 17 : 13);

                  const estimatedTrucks = containerWeight
                    ? (row.ship_gross_weight / (containerWeight * 1000)).toFixed(1)
                    : "N/A";
                  return (
                    <tr key={index} style={{
                      ...getRowBackgroundColorTab2(index),
                      fontFamily: 'calibri',
                      fontSize: '13px', 
                      padding: '4px',
                    }}>
                      <td className="border px-1 py-1" style={{ textAlign: 'center', border: '1px solid white' }}>{row.customer}</td>
                      <td className="border px-1 py-1" style={{ textAlign: 'center', border: '1px solid white' }}>{row.custLocation}</td>
                      <td className="border px-1 py-1" style={{ textAlign: 'center', border: '1px solid white' }}>{row.week_no}</td>
                      <td className="border px-1 py-1" style={{ textAlign: 'right', paddingRight: "10px", border: '1px solid white' }}>{formatNumber(row.parts_count)}</td>
                      <td className="border px-1 py-1" style={{ textAlign: 'right', paddingRight: "10px", border: '1px solid white' }}>{formatNumber(row.box_count)}</td>
                      <td className="border px-1 py-1" style={{ textAlign: 'right', paddingRight: "10px", border: '1px solid white' }}>{formatNumber(row.shipment_net_weight)}</td>
                      <td className="border px-1 py-1" style={{ textAlign: 'right', paddingRight: "10px", border: '1px solid white' }}>{formatNumber(row.cast_gross_weight)}</td>
                      <td className="border px-1 py-1" style={{ textAlign: 'right', paddingRight: "10px", border: '1px solid white' }}>{formatNumber(row.ship_gross_weight)}</td>
                      <td className="border px-1 py-1" style={{ textAlign: 'center', border: '1px solid white' }}>
                        {access===3 ? (
                          <input
                          type="number"
                          value={selectedTonsForRow[index] !== undefined ? selectedTonsForRow[index] : (row.containerWeight || (row.saletype === "EXP" ? 17 : 13))}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setSelectedTonsForRow((prev) => ({
                              ...prev,
                              [index]: newValue,
                            }));
                          }}
                          style={{
                            width: '50%',
                            textAlign: 'center',
                            borderRadius: '5px',
                            border: '1px solid #ddd',
                            padding: '2px',
                          }}
                        />
                        ) : row.containerWeight && row.containerWeight > 0
                        ? row.containerWeight
                        : row.saletype === "EXP"
                        ? 17
                        : 13
                        }
                      </td>
                      <td className="border px-1 py-1" style={{ textAlign: 'right', paddingRight: "10px", border: '1px solid white' }}>
                      {estimatedTrucks}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="border px-4 py-2 text-center">No Data Available</td>
                </tr>
              )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

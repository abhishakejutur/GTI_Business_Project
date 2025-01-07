"use client";
import { useEffect, useState, useRef } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import HyperFormula from 'hyperformula';
import '../handsontable/page.css';
// import '../globals.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./page.css";
import  secureLocalStorage  from  "react-secure-storage";
import { handleLogin } from "@/lib/auth";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';

function Page({ isDarkMode }) {
  const [data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [SaveBtnEnabled,setSaveBtnEnabled] = useState(false);
  const [SaveBtn, setSaveBtn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const hotInstanceRef = useRef(null);
  const containerRef = useRef(null);
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [month, setMonth] = useState([]);
  const [defaultMonth, setDefaultMonth] = useState(null);
  const [defaultYear, setDefaultYear] = useState(null);
  const [finalize, setFinalize] = useState(false);
  const [Save, setSave] = useState(false);
  const [accessData, setAccessData] = useState([]);
  const [access, setAccess] = useState();
  const [userEdit, setUserEdit] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isLastFinalizeMonth, setIsLastFinalizeMonth] = useState();
  const [isLastFinalizeYear, setIsLastFinalizeYear] = useState();
  const [validPartNos, setValidPartNos] = useState([]);
  const invalidCellsRef = useRef(new Set());



  useEffect(() => {
    if (accessData.length > 0) {
      const accessLevel = getAccessForPage("Forecast");
      setAccess(accessLevel);
      // setDashboardAccess(access===3)
      setUserEdit(access===3)
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
  const fetchCurrentMonthAndYear = async () => {
    try {
      const response = await fetch(
        "http://10.40.20.93:300/customerForecast/getLatestMonthAndYear"
      );
      const data = await response.json();
      const { month_No, year_No } = data;
      setIsLastFinalizeYear(year_No);
      setIsLastFinalizeMonth(month_No);
      const adjustedMonth = month_No - 1; 
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
      const defaultDate = new Date(year_No, adjustedMonth, 1);
      setSelectedDate(defaultDate);
      setColumnHeaders(generateMonthYearHeaders(month_No-1, year_No));
      fetchData(month_No, year_No);
      fetchSaveButtonStatus(month_No, year_No);
      setMonth(month_No, year_No);
    } catch (error) {
      console.error("Error fetching current month and year:", error);
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // useEffect(() => {
  //   const initializePage = async () => {
  //     const today = new Date();
  //     const month = today.getMonth() + 1;
  //     const year = today.getFullYear();
  
  //     setDefaultMonth(month);
  //     setDefaultYear(year);
  //     setSelectedDate(new Date(year, month - 1, 1));
  
  //     setColumnHeaders(generateMonthYearHeaders(month - 1, year));
  //     await fetchData(month, year);
  //     await fetchSaveButtonStatus(month, year);
  //   };
  
  //   initializePage();
  // }, []);

  const generateMonthYearHeaders = (month, year) => {
    console.log("month, year:", month, year);
    const headers = [
      'Id', 'Project Name', 'Customer', 'Desc', 'Cast PartNo', 'Mach PartNo', 'Assy PartNo', 'Ship PartNo', 'Sale', 'Material',
      'Cast_wt', 'Month', 'Year'
    ];

    for (let i = 0; i < 12; i++) {
      const monthIndex = (month + i) % 12;
      const yearValue = year + Math.floor((month + i) / 12);
      const monthYear = `${months[monthIndex]}'${yearValue.toString().slice(2)}`;
      headers.push(monthYear);
    }

    return headers;
  };
  useEffect(() => {
    const fetchvalidPartNos = async () => {
      try {
        const response = await fetch("http://10.40.20.93:300/customerForecast/AllValidShipPartNos");
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`);
          return;
        }
        const data = await response.json();
        console.log("Fetched data:", data);
        setValidPartNos(data);
      } catch (error) {
        console.error("Error in fetchvalidPartNos:", error);
      }
    };
    fetchvalidPartNos();
  }, []);
  
  useEffect(() => {
    console.log(" validPartNos are stored :", validPartNos);
  }, [validPartNos]);
  
  const columnKeys = [
    'product_Id', 'projectName', 'customer', 'projectDesc', 'cast_PartNo', 'mach_PartNo', 'assy_PartNo', 'ship_PartNo', 'saletype', 'idm',
    'cast_wt', 'month_No', 'year_No', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'
  ];
  const fetchSaveButtonStatus = async (month, year) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/customerForecast/getsaveBtn?month=${month}&year=${year}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const { saveBtn } = await response.json();
        setSaveBtnEnabled(saveBtn !== 1);
        setIsSaveEnabled(saveBtn !== 1);
        console.log("month, year, saveBtn :",newMonth, newYear, saveBtn);
        console.log("saveBtn :", saveBtn);
        console.log("SaveBtnEnabled :", SaveBtnEnabled);
      } else {
        console.error("Failed to fetch save button status");
      }
    } catch (error) {
      console.error("Error fetching save button status:", error);
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
        console.log("accessing Forecast....");
        // await fetchvalidPartNos();
        console.log("validPartNos:", validPartNos);
      }
    };
    checkLogin();
    const employeeId = secureLocalStorage.getItem("nu");
    const empid = secureLocalStorage.getItem("die");
    fetchEmployeeAccess(empid);
    if (!employeeId) {
      window.location.href = "/";
      return;
    }
    setIsLoggedIn(true);
    // fetchvalidPartNos();
    // fetchData();
    // setColumnHeaders(generateMonthYearHeaders(currentMonth, currentYear));
    // fetchData(currentMonth + 1, currentYear);
    fetchCurrentMonthAndYear();
    // fetchData(month[0], month[1]);
    fetchSaveButtonStatus(newMonth, newYear);
    // handleRefresh(currentMonth + 1, currentYear);

  }, []);

  const fetchData = async (month, year) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/customerForecast?Month_No=${month}&Year_No=${year}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setIsSaveEnabled(false);
        const fetchedData = await response.json();
        console.log("API Response: ", fetchedData," parameter-->", currentMonth + 1, "-----" ,currentYear);

        const tableData = fetchedData.map(item => [
          item.product_Id,
          item.projectName,
          item.customer,
          item.projectDesc,
          item.cast_PartNo,
          item.mach_PartNo,
          item.assy_PartNo,
          `${item.ship_PartNo} | ${item.projectDesc}`,
          item.saletype,
          item.idm,
          item.cast_wt,
          item.month_No,
          item.year_No,
          item.a,
          item.b,
          item.c,
          item.d,
          item.e,
          item.f,
          item.g,
          item.h,
          item.i,
          item.j,
          item.k,
          item.l
        ]);

        setData(tableData);

        if (hotInstanceRef.current) {
          hotInstanceRef.current.loadData(tableData);
        }
      } else {
        console.error('Failed to fetch data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const [newMonth, setNewMonth] = useState(currentMonth + 1);
  const [newYear, setNewYear] = useState(currentYear);
  const handleDateChange = (date) => {
    
    const adjustedDate = new Date(date);
    // adjustedDate.setDate(adjustedDate.getDate());
    console.log("Adjusted Date:", adjustedDate);

    let month = adjustedDate.getMonth()+1;
    let year = adjustedDate.getFullYear();
    let Cmonth = month; 
    let Cyear = year;
    if(Cmonth==1){
      Cmonth=12;
      Cyear=Cyear-1;
    }else{
      Cmonth=Cmonth-1;
    }
    console.log("Checking : Month:", Cmonth, "Year:", Cyear);
    if ((Cyear > isLastFinalizeYear) || (Cyear === isLastFinalizeYear && Cmonth > isLastFinalizeMonth)) {
      console.log("last finalize month and year", isLastFinalizeMonth, isLastFinalizeYear);
      alert("Please finalize previous month");
    }else{
      console.log("Month:", month, "Year:", year);
      setSelectedDate(adjustedDate);
      setNewMonth(month);
      setNewYear(year);
      fetchData(month, year);
      setColumnHeaders(generateMonthYearHeaders(month-1, year));
      fetchSaveButtonStatus(month, year);
    }
  };
  const handleFinalSave = async () => {
    if (!SaveBtnEnabled || !SaveBtn) return;
    try {
      const response = await fetch(`http://10.40.20.93:300/customerForecast/saveBtn?month=${newMonth}&year=${newYear}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert("Final save successful!");
        await fetch(`http://10.40.20.93:300/dashboard/save?Month=${newMonth}&Year=${newYear}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          }
      });
        handleSaveChanges();
        setSaveBtnEnabled(false);
        setIsSaveEnabled(false);
        window.location.reload();
        
      } else {
        console.error('Final save failed:', response.status, response.statusText);
        alert("Failed to finalize the save. Please try again.");
      }
    } catch (error) {
      window.location.reload();
      console.error('Error during final save:', error);
      // alert("An error occurred while saving.");
    }
  };
  const handleSaveChanges = async () => {
    if (!isSaveEnabled || !SaveBtnEnabled) return;
    if (!hotInstanceRef.current) return;
  
    const tableData = hotInstanceRef.current.getData().slice(0, -1).map((row) => {
      const [
        product_Id,
        customer,
        projectName,
        projectDesc,
        cast_PartNo,
        mach_PartNo,
        assy_PartNo,
        ship_PartNo ,
        saletype,
        idm,
        cast_wt,
        month_No,
        year_No,
        a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        i,
        j,
        k,
        l,
      ] = row;
  
      return {
        product_Id: product_Id || 0,
        customer: customer || 'string',
        projectName: projectName || 'string',
        projectDesc: projectDesc || 'string',
        cast_PartNo: cast_PartNo || 'string',
        mach_PartNo: mach_PartNo || 'string',
        assy_PartNo: assy_PartNo || 'string',
        ship_PartNo: ship_PartNo || 'string',
        saletype: saletype || 'string',
        idm: idm || 'string',
        cast_wt: parseFloat(cast_wt) || 0,
        month_No: parseInt(month_No) || 0,
        year_No: parseInt(year_No) || 0,
        a: parseInt(a) || null,
        b: parseInt(b) || null,
        c: parseInt(c) || null,
        d: parseInt(d) || null,
        e: parseInt(e) || null,
        f: parseInt(f) || null,
        g: parseInt(g) || null,
        h: parseInt(h) || null,
        i: parseInt(i) || null,
        j: parseInt(j) || null,
        k: parseInt(k) || null,
        l: parseInt(l) || null,
      };
    });
  
    try {
      const body = JSON.stringify({
        tableData,
        monthNo: newMonth,
        yearNo: newYear,
      });
  
      const response = await fetch('http://10.40.20.93:300/customerForecast/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
  
      if (response.ok) {
        const result = await response.json();
        // alert(result.message);
        setIsSaveEnabled(false);
        setSaveBtn(true);
        fetchData(newMonth, newYear);
      } else {
        console.error('Error saving changes:', response.status, response.statusText);
        const errorText = await response.text();
        setIsSaveEnabled(false);
        setSaveBtn(true);
        fetchData(newMonth, newYear);
        console.error('Response error:', errorText);
        console.error('Failed to save changes. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving changes.');
    }
  };
  const handleRefresh = async () => {
    try {
      const response = await fetch(`http://10.40.20.93:300/refresh?Month_No=${newMonth}&Year_No=${newYear}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        alert('Data refreshed successfully');
        console.log('Data refreshed successfully');
        console.log('Post request parameters:', 'Month : ', currentMonth+1, 'Year : ', currentYear);
        window.location.reload();
        
        fetchData(newMonth, newYear);
      } else {
        console.error('Failed to refresh data:', response.status, response.statusText);
        alert('Failed to refresh data. Please try again.');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('An error occurred while refreshing data.');
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  const downloadExcel = (data) => {
    const columnHeaders = [
      'Id', 'Project Name', 'Customer', 'Desc', 'Cast PartNo', 'Mach PartNo', 'Assy PartNo', 'Ship PartNo', 'Sale', 'Material',
      'Cast_wt', 'Month', 'Year'
    ];
  
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const selectedMonth = newMonth - 1; 
    const selectedYear = newYear;
    for (let i = 0; i < 12; i++) {
      const monthIndex = (selectedMonth + i) % 12;
      const yearValue = selectedYear + Math.floor((selectedMonth + i) / 12);
      const monthYear = `${months[monthIndex]}'${yearValue.toString().slice(2)}`;
      columnHeaders.push(monthYear);
    }
  
    const modifiedData = [columnHeaders, ...data];
    const worksheet = XLSX.utils.json_to_sheet(modifiedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "Forecast.xlsx");
  };
    const cellValidator = (value) => {
    if (value !== null && value !== '' && !Number.isInteger(parseFloat(value))) {
      return false;
    }
    return true;
  };

  const cellRenderer = (instance, td, row, col, prop, value, cellProperties) => {
    const textRenderer = Handsontable.renderers.TextRenderer;
    textRenderer.call(this, instance, td, row, col, prop, value, cellProperties);

    if (col >= 11 && col <= 14) {
      if (!cellValidator(value)) {
        td.style.backgroundColor = 'red';
        td.title = 'Invalid data: Only integers are allowed';
      } else {
        td.style.backgroundColor = '';
        td.title = '';
      }
    }
    if (col === 1) {
      td.title = value || '';
    }
    if (isDarkMode) {
      td.style.backgroundColor = '#333';
      td.style.color = '#f0f0f0';
      td.style.border = '1px solid #555';
      td.style.fontSize = '10px';
      td.style.paddingLeft='10px';
    } else {
      td.style.backgroundColor = '#fff';
      td.style.color = '#333';
      // td.style.border = '1px solid #ddd';
      td.style.fontSize = '11px';
      td.style.cursor = 'cell';
      td.style.paddingLeft='10px';
    }
    if (col === 7) {
      const partNo = value ? value.split(" | ")[0].trim() : null;
      const cellKey = `${row}-${col}`;
    
      if (partNo && !validPartNos.includes(partNo)) {
        // td.style.backgroundColor = 'red';
        td.style.color = 'red';
        td.title = 'This part number does not contains cost/cast wt.'; 
        invalidCellsRef.current.add(cellKey);
      } else {
        td.style.backgroundColor = '';
        td.style.color = 'black';
        td.title = '';
        invalidCellsRef.current.delete(cellKey);
      }
    }
    
  };
  const handleAfterMouseOut = (event, coords, TD) => {
    if (coords.row >= 0 && coords.col >= 0) {
      const cellKey = `${coords.row}-${coords.col}`;
      if (invalidCellsRef.current.has(cellKey)) {
        TD.style.backgroundColor = 'red';
        TD.style.color = 'white';
        TD.title = 'This part number does not contains cost/cast wt.';
      } else {
        TD.style.backgroundColor = '';
        TD.style.color = '#333';
        TD.title = '';
      }
    }
  };
  
  const calculateTotalsRow = (data) => {
    const totalsRow = new Array(25).fill(null);
    
    totalsRow[1] = "Total"; 
    
    for (let col = 13; col <= 24; col++) {
      const columnSum = data.reduce((sum, row) => {
        const value = parseFloat(row[col]);
        return !isNaN(value) ? sum + value : sum; 
      }, 0);
      totalsRow[col] = columnSum; 
    }
  
    return totalsRow;
  };
  useEffect(() => {
    const calculateTotalsRow = (data) => {
      const totalsRow = new Array(25).fill(null); 
      // totalsRow[1] = "Total";
  
      for (let col = 13; col <= 24; col++) {
        const columnSum = data.reduce((sum, row) => {
          const value = parseFloat(row[col]);
          return !isNaN(value) ? sum + value : sum;
        }, 0);
        totalsRow[col] = columnSum; 
      }
  
      return totalsRow;
    };
  
    const updateTableWithTotals = (tableData) => {
      const totalsRow = calculateTotalsRow(tableData);
      return [...tableData, totalsRow];
    };
  
    const handleAfterChange = (changes, source) => {
      if (source === "edit" && changes) {
        const updatedData = hotInstanceRef.current.getData(); 
        const totalsRow = calculateTotalsRow(updatedData); 
        const enhancedData = [...updatedData.slice(0, -1), totalsRow];
        setData(enhancedData);
        hotInstanceRef.current.loadData(enhancedData); 
      }
    };

    const totalsRow = calculateTotalsRow(data);
    const enhancedData = updateTableWithTotals(data);
    if (!containerRef.current) return;

    const instance = new Handsontable(containerRef.current, {
      data: enhancedData,
      rowHeaders: true,
      rowHeaderWidth: 40,
      nestedHeaders: [columnHeaders],
      afterOnCellMouseOut: handleAfterMouseOut,
      cells: (row, col) => ({
        renderer: cellRenderer,
      }),
      readOnly:access!==3,
      height: "100%",
      width: "100%",
      rowHeights: 30,
      colWidths: 120,
      manualColumnResize: true,
      wordWrap: false,
      licenseKey: 'non-commercial-and-evaluation',
      afterColumnSort() {
        let howManyRows = this.countRows() -1;
        this.rowIndexMapper.moveIndexes([this.toVisualRow(howManyRows)]);
      },
      manualRowMove: true,
      // manualColumnMove: true,
      fixedRowsBottom: 1,
      // columnSummary: [
      //   {
      //     sourceColumn: 13, 
      //     type: 'sum',
      //     destinationRow: data.length, 
      //     destinationColumn: 13, 
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 14, 
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 14,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 15, 
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 15,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 16, 
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 16,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 17, 
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 17,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 18,
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 18,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 19, 
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 19,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 20,
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 20,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 21, 
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 21,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 22,
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 22,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 23,
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 23,
      //     forceNumeric: true,
      //   },
      //   {
      //     sourceColumn: 24,
      //     type: 'sum',
      //     destinationRow: data.length,
      //     destinationColumn: 24,
      //     forceNumeric: true,
      //   },
      // ],
      
      afterChange: handleAfterChange,
      afterRenderer: (td, row, col, prop, value, cellProperties) => {
        if (row === enhancedData.length - 1) {
          td.style.backgroundColor = "#eee";
          td.style.textAlign = "right";
          td.style.fontWeight = "bold";
          td.style.readOnly = true;
          // td.style.borderRight = "none";
          if (col === 2) {
            td.innerText = "Total";
          }
          if (col < 8) {
            td.style.borderRight = "1px solid #eee";
          }
        }
      },
      beforeChange: (changes, source) => {
        if (source === 'UndoRedo.undo' || source === 'UndoRedo.redo') {
          changes.forEach(([row, col], index) => {
            if (row === data.length) {
              changes[index] = null; 
            }
          });
        }
      },
      stretchH: 'all',
      headerTooltips: true,
      columnSorting: true,
      dropdownMenu: ['filter_by_condition', 'filter_by_value', 'filter_action_bar'],
      filters: true,
      allowRemoveRow: true,
      allowInsertRow: true,
      allowInsertColumn: false,
      allowRemoveColumn: false,
      fixedColumnsStart: 8,
      contextMenu: false,
      clipboard: true,
      // contextMenu: {
      //   items: {
      //     'copy': { name: 'Copy' },
      //     'cut': { name: 'Cut' },
      //     'paste': { name: 'Paste' },
      //   }
      // },
      formulas: { engine: HyperFormula },
      manualRowPaste: true,
      hiddenColumns: { indicators: false, columns: [0, 3, 4, 5, 6, 9, 10, 11, 12] },
      columns: [
        { width: "5%", readOnly: true, className: 'htLeft htMiddle'},
        { width: "150%", readOnly: true, className: 'htLeft htMiddle' },
        { width: "98%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "5%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "70%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "70%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "70%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "100%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "1%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "5%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "5%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "10%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "10%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "1%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
      ],
      dropdownMenu: {
        items: {
          filter_by_condition: {
            hidden() {
              const col = this.getSelectedRangeLast().to.col;
              return ![0, 1, 2, 3, 4, 5, 6, 7, 8].includes(col);
            },
          },
          filter_by_value: {
            hidden() {
              const col = this.getSelectedRangeLast().to.col;
              return ![0, 1, 2, 3, 4, 5, 6, 7, 8].includes(col);

            },
          },
          filter_action_bar: {
            hidden() {
              const col = this.getSelectedRangeLast().to.col;
              return ![0, 1, 2, 3, 4, 5, 6, 7, 8].includes(col);
            },
          },
        },
      },
      cells: (row, col) => {
        return {
          renderer: cellRenderer,
        };
      },
      afterChange: (changes, source) => {
        if (source === 'edit' && SaveBtnEnabled) {
          setIsSaveEnabled(true);
          setSaveBtn(false);
          console.log(SaveBtn);
        }
      },
      afterGetColHeader: function (col, TH) {
        if (col > 2 && col != 7 && col !== 8) {
          const button = TH.querySelector('.changeType');
    
          if (!button) {
            return;
          }
    
          button.parentElement.removeChild(button);
        }
        TH.style.background = '#eee';
        TH.style.color = '#68616E';
        // TH.style.borderBottom = '1px solid #ccc';
        TH.style.fontWeight = 'bold';
        TH.style.textAlign = 'center';
        TH.style.verticalAlign = 'middle';
        TH.style.fontSize = '12px';
      },
      afterOnCellMouseOver: function (event, coords, TD) {
        if (coords.row >= 0) {
          TD.style.background = '#9EA3AD';
          TD.style.color = 'white';
          // TD.style.fontWeight = 'bold';
        }
        const cellKey = `${coords.row}-${coords.col}`; 
        if (coords.row >= 0 && invalidCellsRef.current.has(cellKey)) {
          TD.style.backgroundColor = 'red';
          TD.style.color = 'white';
          TD.title = 'This part number does not contains cost/cast wt.';
        } else {
          TD.style.background = '#9EA3AD';
          TD.style.color = 'white';
        }
      },
      afterOnCellMouseOut: function (event, coords, TD) {
        const { row, col } = coords;
        
        if (coords.row >= 0) {
          TD.style.background = '';
          TD.style.color = '#333';
        }
        const cellKey = `${coords.row}-${coords.col}`; 
        if (coords.row >= 0 && invalidCellsRef.current.has(cellKey)) {
          TD.style.backgroundColor = 'white';
          TD.style.color = 'red';
          TD.title = 'This part number does not contains cost/cast wt.';
        } else {
          TD.style.background = '';
          TD.style.color = '#68616E';
          // TD.style.fontWeight = 'bold';
        }
      
        if (coords.row === data.length) {
          TD.classList.add('fixed-total-row'); 
          TD.style.backgroundColor = '#eee';
        }
      },
      
    });
    hotInstanceRef.current = instance;
    return () => instance.destroy();
  }, [data]);
  
  return (
    <div className='card'>
      <div className='card-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 className='hanson-title'>Customer Forecast</h2>
          {SaveBtnEnabled && (
            <HoverCard>
            <HoverCardTrigger asChild>
              <FontAwesomeIcon
                icon={faSync}
                onClick={handleRefresh}
                style={{
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#4CAF50',
                  fontWeight: 'bold',
                }}
              />
            </HoverCardTrigger>
            <HoverCardContent
              className="w-64"
              style={{
                zIndex: 1050,
                // position: 'absolute',
                backgroundColor: '#fff',
                border: '1px solid black',
              }}
            >
              <div className="p-2">
                <h4 className="text-sm font-semibold">Refresh</h4>
                <p className="text-xs text-muted-foreground">
                  Click here to refresh the part data.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div>
          <Button className='bg-green-700 hover:bg-green-900 h-9' onClick={()=>downloadExcel(data)}>
            <FontAwesomeIcon icon={faFileExcel} style={{ cursor: 'pointer', fontSize: '25px', color: 'white', fontWeight: 'bold' }} />
          </Button>
        </div>
        <div className="datepicker-container">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            placeholderText="Select Month/Year"
            className="calendar-input styled-datepicker"
          />
        </div>
          <button
            hidden = {access !==3}
            className='save-button'
            onClick={handleSaveChanges}
            disabled={!isSaveEnabled || !SaveBtnEnabled}
            style={{
              padding: '10px 20px',
              backgroundColor: isSaveEnabled && SaveBtnEnabled ? '#4CAF50' : '#888',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: isSaveEnabled && SaveBtnEnabled ? 'pointer' : 'not-allowed',
              fontSize: '12px',
            }}
          >
            Save
          </button>
          <button
            hidden = {access!==3}
            className='save-button'
            onClick={handleFinalSave}
            disabled={!SaveBtnEnabled && !SaveBtn}
            style={{
              padding: '10px 20px',
              backgroundColor: SaveBtnEnabled && SaveBtn ? '#0e71c9' : '#946f67',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: SaveBtnEnabled && SaveBtn ? 'pointer' : 'not-allowed',
              fontSize: '12px',
            }}
          >
            Finalize
          </button>
        </div>
      </div>
      <div className="handsontable-wrapper">
        <div ref={containerRef} id="example" className="custom-table"></div>
      </div>
    </div>
  );
}
//
export default Page;
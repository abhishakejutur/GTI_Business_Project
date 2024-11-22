"use client";
import { useEffect, useState, useRef } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import HyperFormula from 'hyperformula';
import '../handsontable/page.css';
// import '../globals.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./page.css";

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

 

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

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
    const employeeId = localStorage.getItem("username");
    if (!employeeId) {
      window.location.href = "/";
      return;
    }
    setIsLoggedIn(true);
    // fetchData();
    setColumnHeaders(generateMonthYearHeaders(currentMonth, currentYear));
    fetchData(currentMonth + 1, currentYear);
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
    adjustedDate.setDate(adjustedDate.getDate());
    console.log("Adjusted Date:", adjustedDate);

    const month = adjustedDate.getMonth()+1;
    const year = adjustedDate.getFullYear();
    setSelectedDate(adjustedDate);
    setColumnHeaders(generateMonthYearHeaders(month-1, year));
    setNewMonth(month);
    setNewYear(year);
    fetchData(month, year);
    fetchSaveButtonStatus(month, year);
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
      console.error('Error during final save:', error);
      alert("An error occurred while saving.");
    }
  };
  const handleSaveChanges = async () => {
    if (!isSaveEnabled || !SaveBtnEnabled) return;
    if (!hotInstanceRef.current) return;
  
    const tableData = hotInstanceRef.current.getData().map((row) => {
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
      } else {
        console.error('Error saving changes:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Response error:', errorText);
        alert('Failed to save changes. Please try again.');
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
    } else {
      td.style.backgroundColor = '#fff';
      td.style.color = '#333';
      // td.style.border = '1px solid #ddd';
      td.style.fontSize = '11px';
      td.style.cursor = 'cell';
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new Handsontable(containerRef.current, {
      data,
      rowHeaders: true,
      nestedHeaders: [columnHeaders],
      height: "100%",
      width: "100%",
      rowHeights: 30,
      colWidths: 120,
      manualColumnResize: true,
      wordWrap: false,
      licenseKey: 'non-commercial-and-evaluation',
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
        if (col > 2 && col != 7) {
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
      },
      afterOnCellMouseOut: function (event, coords, TD) {
        if (coords.row >= 0) {
          TD.style.background = '';
          TD.style.color = '#333';
          TD.style.fontWeight = '';
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
          <FontAwesomeIcon
              icon={faSync}
              onClick={handleRefresh}
              style={{ cursor: 'pointer', fontSize: '20px', color: '#4CAF50', fontWeight:'bold' }}
            />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
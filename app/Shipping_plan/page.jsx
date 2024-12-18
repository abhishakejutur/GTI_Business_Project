"use client";
import { useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import HyperFormula from 'hyperformula';
import '../handsontable/page.css';
// import '../globals.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import './page.css';
import  secureLocalStorage  from  "react-secure-storage";
import { handleLogin } from "@/lib/auth";

function Page({ isDarkMode }) {
  const [data, setData] = useState([['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [weekOptions, setWeekOptions] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [SaveBtnEnabled,setSaveBtnEnabled] = useState(false);
  const [SaveBtn, setSaveBtn] = useState(false);
  // const [locationOptions, setLocationOptions] = useState([]);
  const [hotInstance, setHotInstance] = useState(null);
  const [finalize, setFinalize] = useState(false);
  const [Save, setSave] = useState(false);
  const [accessData, setAccessData] = useState([]);
  const [access, setAccess] = useState();
  const [userEdit, setUserEdit] = useState(false);
  const [isRefresh , setIsRefresh] = useState(false);
  const [latestPlanWeek, setLatestPlanWeek] = useState();
  const [latestPlanYear, setLatestPlanYear] = useState();
  
  let nextId = data.length + 1;

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
        console.log("accessing Shipping Schedule...");
      }
    };
    checkLogin();
    const content = document.querySelector("#content main");
    const empid = secureLocalStorage.getItem("die");
    // content.style.overflowY.width="hidden";
    fetchEmployeeAccess(empid);
    lastFinalizeWeek();
  }, []);
  useEffect(() => {
    if (accessData.length > 0) {
      const accessLevel = getAccessForPage("ShippingSchedule");
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

  const staticHeaders = [
    { label: 'Project Details', colspan: 8 }
  ];

  const setWeekHeaders = (startingWeek) => {
    const weekHeaders = Array.from({ length: 6 }, (_, i) => {
      const weekNumber = (startingWeek + i - 1) % 52 + 1;
      return {
          label: `WK${weekNumber}`,
          colspan: 4
      };
  });

    const subHeaders = [
        'Week No.','DATE','QTY.', 'BOX', 
        'Week No.','DATE','QTY.', 'BOX', 
        'Week No.','DATE','QTY.', 'BOX', 
        'Week No.','DATE','QTY.', 'BOX', 
        'Week No.','DATE','QTY.', 'BOX', 
        'Week No.','DATE','QTY.', 'BOX', 
    ];

    return [
        [...staticHeaders, ...weekHeaders],
        ['Project', 'Part#', 'P.Name', 'Customer', 'Location', 'B/Qty', 'Sale', ...subHeaders]
    ];
  };
  

  const columnHeaders = [
    'Project', 'Part#', 'P.Name', 'Customer', 'Location', 'Box Qty', 'Sale',
    'Week No.', 'Date', 'QTY .', 'Box', 'Week No.', 'Date', 'QTY .', 'Box',
    'Week No.', 'Date', 'QTY .', 'Box', 'Week No.', 'Date', 'QTY .', 'Box',
    'Week No.', 'Date', 'QTY .', 'Box', 'Week No.', 'Date', 'QTY .', 'Box'
  ];
  
  const columnKeys = [
    'projectName', 'partNo', 'partName', 'customer', 'custLocation', 'actual_Boxqty', 'saleType',
    'week1', 'date1', 'qty1', 'box1', 'week2', 'date2', 'qty2', 'box2',
    'week3', 'date3', 'qty3', 'box3', 'week4', 'date4', 'qty4', 'box4',
    'week5', 'date5', 'qty5', 'box5', 'week6', 'date6', 'qty6', 'box6'
  ];
  const fetchSaveButtonStatus = async () => {
    let weekNumber, year;
    if (selectedWeek) {
      [weekNumber, year] = selectedWeek.split('-');
      weekNumber = parseInt(weekNumber);
      year = parseInt(year);
    }
    try {
      const response = await fetch(`http://10.40.20.93:300/shippingSchedule/getsaveBtn?PlanWeek=${weekNumber}&Year_No=${year}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const { saveBtn } = await response.json();
        setSaveBtnEnabled(saveBtn !== 1);
        console.log('fetchSaveButtonStatus',saveBtn);
      } else {
        console.error("Failed to fetch save button status");
      }
    } catch (error) {
      console.error("Error fetching save button status:", error);
    }
  };
  const getCurrentWeekNumber = () => {
    const date = new Date();
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);
    return weekNumber;
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
  useEffect(() => {
    const employeeId = secureLocalStorage.getItem("nu");
    if (!employeeId) {
      window.location.href = "/";
      return;
    }
    setIsLoggedIn(true);
    fetch('http://10.40.20.93:300/BTrail/weeks')
      .then(response => response.json())
      .then(fetchedWeekOptions => {
        setWeekOptions(fetchedWeekOptions);

        const currentWeekNumber = getCurrentWeekNumber();
        const defaultWeek = fetchedWeekOptions.find(week => week.value.startsWith(`${currentWeekNumber}-`));
        if (defaultWeek) {
            setSelectedWeek(defaultWeek.value); 
        } else if (fetchedWeekOptions.length > 0) {
            setSelectedWeek(fetchedWeekOptions[0].value); 
        }

        fetchSaveButtonStatus();
      })
      .catch(error => console.error('Error fetching week options:', error));
  }, []);


  const handleWeekChange = (event) => {
    const selectedWeekValue = event.target.value;
    setSaveBtnEnabled(false);
    setIsSaveEnabled(false);

    if (selectedWeekValue) {
        setSelectedWeek(selectedWeekValue);
        let [weekNumber, year] = selectedWeekValue.split('-');
        weekNumber = parseInt(weekNumber);
        year = parseInt(year);

        lastFinalizeWeek();
        if(weekNumber > latestPlanWeek || year > latestPlanYear){
          alert("please finalize the previous week plan");
          setSelectedWeek(latestPlanWeek + "-" + latestPlanYear);
          return
        } else {
          const updatedNestedHeaders = setWeekHeaders(weekNumber);

          if (hotInstance) {
            hotInstance.updateSettings({
                nestedHeaders: updatedNestedHeaders
            });
            hotInstance.render();
          }
          fetchSaveButtonStatus();
        }
        
    }
  };

  useEffect(() => {
    if (selectedWeek) {
      fetchSaveButtonStatus();
      fetchWeekData(selectedWeek);
    }
  }, [selectedWeek]);

  const fetchWeekData = async (weekValue) => {
    if (!weekValue) return;
    let [weekNumber, year] = weekValue.split('-');
    weekNumber = parseInt(weekNumber);
    year = parseInt(year);
    lastFinalizeWeek();
    if(weekNumber > latestPlanWeek || year > latestPlanYear){
      // alert("please finalize the previous week plan : ", weekNumber, " - ", year);
      return
    } 
    try {
      const response = await fetch(`http://10.40.20.93:300/BTrail/weekData?week=${weekNumber}&year=${year}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsSaveEnabled(false);
        const fetchedData = await response.json();
        const tableData = fetchedData.map(item => [
          item.projectName,
          `${item.partNo} | ${item.partName}`,
          item.partName,
          item.customer,
          item.custLocation,
          item.actual_Boxqty,
          item.saleType,
          item.week1,
          formatDateForDisplay(item.date1),
          item.qty1,
          item.box1 || '',
          item.week2,
          formatDateForDisplay(item.date2),
          item.qty2,
          item.box2 || '',
          item.week3,
          formatDateForDisplay(item.date3),
          item.qty3,
          item.box3 || '',
          item.week4,
          formatDateForDisplay(item.date4),
          item.qty4,
          item.box4 || '',
          item.week5,
          formatDateForDisplay(item.date5),
          item.qty5,
          item.box5 || '',
          item.week6,
          formatDateForDisplay(item.date6),
          item.qty6,
          item.box6 || ''
        ]);

        setData(tableData.length ? tableData : data);

        if (hotInstance) {
          hotInstance.loadData(tableData);
          hotInstance.render(); 
        }

        nextId = tableData.length + 1;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleFinalSave = async () => {
    if (!SaveBtnEnabled || !SaveBtn) return;
  
    let weekNumber, year;
    if (selectedWeek) {
      [weekNumber, year] = selectedWeek.split('-');
      weekNumber = parseInt(weekNumber);
      year = parseInt(year);
    }
  
    try {
      const response = await fetch(`http://10.40.20.93:300/shippingSchedule/saveBtn?PlanWeek=${weekNumber}&Year_No=${year}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (response.ok) {
        alert("Final save successful!");
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
  
  const handleSaveChanges = async (isRefresh) => {
    if (!isSaveEnabled || !SaveBtnEnabled || !isRefresh) return;
    if (!selectedWeek) {
      alert('Please select a week before saving changes.');
      return;
    }
    
    let [weekNumber, year] = selectedWeek.split('-');
    weekNumber = parseInt(weekNumber);
    year = parseInt(year);
  
    try {
      const displayedData = hotInstance.getData().slice(0, -1);
      const formattedData = displayedData.map(row => {
        const rowData = {};
        columnKeys.forEach((key, index) => {
          if (key.includes('week')) {
            rowData[key] = row[index] || null;
          } else if (key.includes('date')) {
            rowData[key] = row[index] === '' ? null : formatDateForBackend(row[index]);
          } else if (key.includes('qty') || key.includes('box')) {
            rowData[key] = row[index] === '' ? null : parseFloat(row[index]) || 0.00;
          } else if (key === 'partNo') {
            rowData[key] = row[index].split(' | ')[0];
          } else {
            rowData[key] = row[index];
          }
        });
        return rowData;
      });
  
      const response = await fetch(`http://10.40.20.93:300/BTrail/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableData: formattedData, weekNumber, year }),
      });
  
      if (response.ok) {
        setIsSaveEnabled(false);
        setSaveBtn(true);
        console.log('Data saved successfully and button enabled', isSaveEnabled);
        fetchWeekData(selectedWeek); 
        return true;
      } else {
        const errorText = await response.text();
        console.error('Failed to save changes:', errorText);
        fetchWeekData(selectedWeek); 
        alert('Failed to save changes: ' + errorText);
        return true;
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Check console for details.');
      return false;
    }
  };
  const handleSave = async () => {
    // if (!isSaveEnabled || !SaveBtnEnabled || !isRefresh) return;
    if (!selectedWeek) {
      alert('Please select a week before saving changes.');
      return;
    }
    
    let [weekNumber, year] = selectedWeek.split('-');
    weekNumber = parseInt(weekNumber);
    year = parseInt(year);
  
    try {
      const displayedData = hotInstance.getData().slice(0, -1);
      const formattedData = displayedData.map(row => {
        const rowData = {};
        columnKeys.forEach((key, index) => {
          if (key.includes('week')) {
            rowData[key] = row[index] || null;
          } else if (key.includes('date')) {
            rowData[key] = row[index] === '' ? null : formatDateForBackend(row[index]);
          } else if (key.includes('qty')) {
            rowData[key] = row[index] === '' ? null : parseFloat(row[index]) || 0.0;
          } else if (key.includes('box')) {
            const boxValue = parseFloat(row[index]);
            rowData[key] = isNaN(boxValue) ? null : Math.round(boxValue);
          } else if (key === 'partNo') {
            rowData[key] = row[index].split(' | ')[0];
          } else {
            rowData[key] = row[index];
          }
        });
        return rowData;
      });
  
      const response = await fetch(`http://10.40.20.93:300/BTrail/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableData: formattedData, weekNumber, year }),
      });
  
      if (response.ok) {
        setIsSaveEnabled(false);
        setSaveBtn(true);
        console.log('Data saved successfully and button enabled', isSaveEnabled);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Failed to save changes:', errorText);
        alert('Failed to save changes: ' + errorText);
        return true;
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Check console for details.');
      return false;
    }
  };
  const handleRefresh = async () => {
   
    if (!selectedWeek) {
      alert("Please select a week before finalizing the save.");
      return;
    }
    
    let [weekNumber, year] = selectedWeek.split('-');
    weekNumber = parseInt(weekNumber);
    year = parseInt(year);
    try {
      const saveResult = await handleSaveChanges();

    // if (saveResult !== true) {
    //   console.error('Save operation failed or incomplete.');
    //   alert("Please fix save errors before refreshing.");
    //   return;
    // }

    // // Refresh week data
    // await fetchWeekData(selectedWeek);
      const response = await fetch(`http://10.40.20.93:300/BTrail/shippingSchedule/refresh?PlanWeek=${weekNumber}&Year_No=${year}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        alert('Data refreshed successfully');
        console.log('Data refreshed successfully');
        console.log('Post request parameters:', 'Week : ', weekNumber, 'Year : ', year);
        window.location.reload();
        fetchWeekData(selectedWeek); 
      } else {
        console.error('Failed to refresh data:', response.status, response.statusText);
        alert('Failed to refresh data. Please try again.');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('An error occurred while refreshing data.');
    }
  };
  
  const formatDateForBackend = (dateStr) => {
    if (!dateStr || dateStr === '') return null; 
  
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return null; 
    
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const cellValidator = (value) => {
    if (value !== null && value !== '' && isNaN(value)) {
      return false;
    }
    return true;
  };
  const cellRenderer = (instance, td, row, col, prop, value, cellProperties) => {
    const textRenderer = Handsontable.renderers.TextRenderer;
    if (typeof textRenderer === "function") {
      textRenderer.call(this, instance, td, row, col, prop, value, cellProperties);
    }
    const boxColumns = [10, 14, 18, 22, 26, 30];
  if (boxColumns.includes(col)) {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      td.innerText = numericValue.toFixed(1);
    }
  }
    const invalidColumns = [9, 13, 17, 21, 25, 29];
    if (invalidColumns.includes(col) && (value === '' || isNaN(value) || parseInt(value) != value)) {
      td.style.backgroundColor = 'red';
      td.title = 'Only integers are only allowed here';
    } else {
      td.style.backgroundColor = '';
      td.title = '';
    }
    
    const tooltip = document.createElement('div');
    
    if (col === 0) {
      td.title = value || '';
      td.style.color = 'white';
      // tooltip.className = 'custom-tooltip';
      // tooltip.innerText = value || '';
    }
  //   td.addEventListener('mouseenter', (event) => {
  //   tooltip.style.display = 'block';
  //   tooltip.style.left = `${event.pageX + 5}px`; 
  //   tooltip.style.top = `${event.pageY + 5}px`;
  //   document.body.appendChild(tooltip);
  // });

  // td.addEventListener('mouseleave', () => {
  //   tooltip.style.display = 'none';
  //   if (tooltip.parentNode) {
  //     tooltip.parentNode.removeChild(tooltip);
  //   }
  // });

    if (isDarkMode) {
      td.style.backgroundColor = '#333';
      td.style.color = '#f0f0f0';
      td.style.fontSize = '10px';
      td.style.paddingLeft='10px';
    } else {
      td.style.backgroundColor = '#fff';
      td.style.color = '#333';
      td.style.fontSize = '11px';
      td.style.cursor = 'cell';
      td.style.paddingLeft='10px';
    }
  };

  const calculateTotalsRow = (data, qtyColumns, boxColumns) => {
    const totalsRow = new Array(data[0]?.length || 0).fill(null);
    qtyColumns.forEach((colIndex) => {
      const totalQty = data.reduce((sum, row) => {
        const value = parseFloat(row[colIndex]);
        return !isNaN(value) ? sum + value : sum;
      }, 0);
      totalsRow[colIndex] = totalQty;
    });
  
    boxColumns.forEach((colIndex) => {
      const totalBox = data.reduce((sum, row) => {
        const value = parseFloat(row[colIndex]);
        return !isNaN(value) ? sum + value : sum;
      }, 0);
      totalsRow[colIndex] = totalBox;
    });
  
    return totalsRow;
  };
  
  useEffect(() => {
    const qtyColumns = [9, 13, 17, 21, 25, 29]; 
    const boxColumns = [10, 14, 18, 22, 26, 30]; 

    const addTotalsRow = (data) => {
      const totalsRow = calculateTotalsRow(data, qtyColumns, boxColumns);
      return [...data, totalsRow]; 
    };

    const enhancedData = addTotalsRow(data); 

    const container = document.querySelector('#example');
    if (!container) return;

    const instance = new Handsontable(container, {
    data: enhancedData, 
      rowHeaders: false,
      nestedHeaders: setWeekHeaders(parseInt(selectedWeek.split('-')[0]) || 0),
      height: "100%",
      width: "100%",
      rowHeights: 30,
      readOnly:access!==3,
      fixedRowsBottom: 1, 
      afterRenderer: (td, row, col, prop, value, cellProperties) => {
        if (row === enhancedData.length - 1) {
          td.style.backgroundColor = "#eee";
          td.style.textAlign = "right";
          td.style.fontWeight = "bold";
          td.style.readOnly = true;
          // td.style.borderRight = "none";
          if (col === 1) {
            td.innerText = "Total";
            td.style.textAlign = "left";
          }
          if (col < 6) {
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
      colWidths: 120,
      autoWrapRow: true,
      autoWrapCol: true,
      manualColumnResize: true,
      wordWrap: false,
      manualRowMove: true,
      // manualColumnMove: true,
      licenseKey: 'non-commercial-and-evaluation',
      afterColumnSort() {
        let howManyRows = this.countRows() -1;
        this.rowIndexMapper.moveIndexes([this.toVisualRow(howManyRows)]);
      },
      stretchH: 'all',
      headerTooltips: true,
      columnSorting: true,
      dropdownMenu: ['filter_by_condition', 'filter_by_value', 'filter_action_bar'],
      datePickerConfig: {
        firstDay: 1,
        showWeekNumber: true,
      },
      filters: true,
      allowRemoveRow: true,
      allowInsertRow: true,
      allowInsertColumn: false,
      allowRemoveColumn: false,
      fixedColumnsStart: 7,
      contextMenu: false,
      formulas: {
        engine: HyperFormula,
      },
      hiddenColumns: {
        indicators: false,
        columns:[2, 3, 7, 11, 15, 19, 23, 27]
      },
      cells: function (row, col) {
        const cellProperties = {};
        cellProperties.readOnly = access !== 3;
        cellProperties.renderer = cellRenderer;
        return cellProperties;
      },
      // contextMenu: {
      //   items: {
      //     'undo': { name: 'Undo' },
      //     'redo': { name: 'Redo' },
      //     'copy': { name: 'Copy' },
      //     'cut': { name: 'Cut' }
      //   }
      // },
      dropdownMenu: {
        items: {
          filter_by_condition: {
            hidden() {
              const col = this.getSelectedRangeLast().to.col;
              return ![0, 1, 3, 4].includes(col);
            },
          },
          filter_by_value: {
            hidden() {
              const col = this.getSelectedRangeLast().to.col;
              return ![0, 1, 3, 4].includes(col);
            },
          },
          filter_action_bar: {
            hidden() {
              const col = this.getSelectedRangeLast().to.col;
              return ![0, 1, 3, 4].includes(col);
            },
          },
        },
      },
      afterGetColHeader: function (col, TH) {
        if (col > 1) {
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
          TD.style.color = '#fff';
        }
      },
      afterOnCellMouseOut: function (event, coords, TD) {
        if (coords.row >= 0) {
          TD.style.background = '';
          TD.style.color = '#333';
        }
        if (coords.row === data.length) {
          TD.classList.add('fixed-total-row'); 
          TD.style.backgroundColor = '#eee';
        }
      },
      afterCreateRow: (index, amount) => {
        for (let i = 0; i < amount; i++) {
          const rowIndex = index + i;
          instance.setDataAtCell(rowIndex, 0, nextId);
          nextId++;
        }
      },
      columns: [
        { className: 'htLeft htMiddle' ,width: "175%", readOnly: true, dropdownMenu: false }, 
        { width: "100%", readOnly: true, className: 'htCenter htMiddle' }, 
        { width: "3%", readOnly: true, className: 'htCenter htMiddle' },
        { className: 'htCenter htMiddle', width: "100%", readOnly: true},
        {
          // type: 'dropdown',
          // source: locationOptions,
          readOnly: true,
          width: "95%", 
          className: 'htCenter htMiddle',
        },
        { width: "3%", className: 'htRight htMiddle' }, 
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, 
        { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, 
        { width: "1%", className: 'htRight htMiddle', renderer: cellRenderer, type: 'numeric' }, 
        { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, 
        { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' },
        { width: "3%", className: 'htRight htMiddle', renderer: cellRenderer, type: 'numeric' }, 
        { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, 
        { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, 
        { width: "3%", className: 'htRight htMiddle', renderer: cellRenderer, type: 'numeric' }, 
        { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, 
        { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, 
        { width: "3%", className: 'htRight htMiddle', renderer: cellRenderer, type: 'numeric' }, 
        { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, 
        { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, 
        { width: "3%", className: 'htRight htMiddle', renderer: cellRenderer, type: 'numeric' }, 
        { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, 
        { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, 
        { width: "3%", className: 'htRight htMiddle', renderer: cellRenderer, type: 'numeric' }, 
        { readOnly: true, width: "3%", className: 'htRight htMiddle' }
      ],
      cells: function (row, col) {
        const cellProperties = {};
        cellProperties.renderer = cellRenderer;
        return cellProperties;
      }, 
      cells: function (row, col) {
        const cellProperties = {};
        cellProperties.renderer = cellRenderer;
        

        return cellProperties;
      },
      
      afterChange: (changes, source) => {
        if (source === 'loadData' || !changes) return;
        changes.forEach(([row, prop, oldValue, newValue]) => {
          const date1Index = 8;
          const date2Index = 12;
          const date3Index = 16;
          const date4Index = 20;
          const date5Index = 24;
          const date6Index = 28;
          try {
            if (row < 0 || row >= data.length) {
                console.warn('Row index out of bounds:', row);
                return;
            }
            if (prop === date1Index) {
                const dateValue = newValue || ''; 
                const date1 = new Date(dateValue.split('/').reverse().join('-')); 
                if (isNaN(date1.getTime())) {
                } else {
                    if (!instance.getDataAtCell(row, date2Index)) {
                        const date2 = new Date(date1);
                        date2.setDate(date1.getDate() + 7);
                        instance.setDataAtCell(row, date2Index, formatDateForDisplay(date2), 'edit');
                    }
                    if (!instance.getDataAtCell(row, date3Index)) {
                        const date3 = new Date(date1);
                        date3.setDate(date1.getDate() + 14);
                        instance.setDataAtCell(row, date3Index, formatDateForDisplay(date3), 'edit');
                    }
                    if (!instance.getDataAtCell(row, date4Index)) {
                        const date4 = new Date(date1);
                        date4.setDate(date1.getDate() + 21);
                        instance.setDataAtCell(row, date4Index, formatDateForDisplay(date4), 'edit');
                    }
                    if (!instance.getDataAtCell(row, date5Index)) {
                        const date5 = new Date(date1);
                        date5.setDate(date1.getDate() + 28);
                        instance.setDataAtCell(row, date5Index, formatDateForDisplay(date5), 'edit');
                    }
                    if (!instance.getDataAtCell(row, date6Index)) {
                        const date6 = new Date(date1);
                        date6.setDate(date1.getDate() + 35);
                        instance.setDataAtCell(row, date6Index, formatDateForDisplay(date6), 'edit');
                    }
                }
            }
            if (prop === date2Index) {
              const dateValue = newValue || ''; 
              const date2 = new Date(dateValue.split('/').reverse().join('-')); 
              if (isNaN(date2.getTime())) {
              } else {
                  if (!instance.getDataAtCell(row, date3Index)) {
                      const date3 = new Date(date2);
                      date3.setDate(date2.getDate() + 7);
                      instance.setDataAtCell(row, date3Index, formatDateForDisplay(date3), 'edit');
                  }
                  if (!instance.getDataAtCell(row, date4Index)) {
                      const date4 = new Date(date2);
                      date4.setDate(date2.getDate() + 14);
                      instance.setDataAtCell(row, date4Index, formatDateForDisplay(date4), 'edit');
                  }
                  if (!instance.getDataAtCell(row, date5Index)) {
                      const date5 = new Date(date2);
                      date5.setDate(date2.getDate() + 21);
                      instance.setDataAtCell(row, date5Index, formatDateForDisplay(date5), 'edit');
                  }
                  if (!instance.getDataAtCell(row, date6Index)) {
                      const date6 = new Date(date2);
                      date6.setDate(date2.getDate() + 28);
                      instance.setDataAtCell(row, date6Index, formatDateForDisplay(date6), 'edit');
                  }
              }
            }
            if (prop === date3Index) {
              const dateValue = newValue || ''; 
              const date3 = new Date(dateValue.split('/').reverse().join('-')); 
              if (isNaN(date3.getTime())) {
              } else {
                  if (!instance.getDataAtCell(row, date4Index)) {
                      const date4 = new Date(date3);
                      date4.setDate(date3.getDate() + 7);
                      instance.setDataAtCell(row, date4Index, formatDateForDisplay(date4), 'edit');
                  }
                  if (!instance.getDataAtCell(row, date5Index)) {
                      const date5 = new Date(date3);
                      date5.setDate(date3.getDate() + 14);
                      instance.setDataAtCell(row, date5Index, formatDateForDisplay(date5), 'edit');
                  }
                  if (!instance.getDataAtCell(row, date6Index)) {
                      const date6 = new Date(date3);
                      date6.setDate(date3.getDate() + 21);
                      instance.setDataAtCell(row, date6Index, formatDateForDisplay(date6), 'edit');
                  }
              }
            }
            if (prop === date4Index) {
              const dateValue = newValue || ''; 
              const date4 = new Date(dateValue.split('/').reverse().join('-')); 
              if (isNaN(date4.getTime())) {
              } else {
                  if (!instance.getDataAtCell(row, date5Index)) {
                      const date5 = new Date(date4);
                      date5.setDate(date4.getDate() + 7);
                      instance.setDataAtCell(row, date5Index, formatDateForDisplay(date5), 'edit');
                  }
                  if (!instance.getDataAtCell(row, date6Index)) {
                      const date6 = new Date(date4);
                      date6.setDate(date4.getDate() + 14);
                      instance.setDataAtCell(row, date6Index, formatDateForDisplay(date6), 'edit');
                  }
              }
            }
            if (prop === date5Index) {
              const dateValue = newValue || ''; 
              const date5 = new Date(dateValue.split('/').reverse().join('-')); 
              if (isNaN(date5.getTime())) {
              } else {
                  if (!instance.getDataAtCell(row, date6Index)) {
                      const date6 = new Date(date5);
                      date6.setDate(date5.getDate() + 7);
                      instance.setDataAtCell(row, date6Index, formatDateForDisplay(date6), 'edit');
                  }
              }
            }
          } catch (error) {
              console.error('Error in afterChange:', error);
          }
          const qtyColumns = [9, 13, 17, 21, 25, 29];
          const boxColumns = [10, 14, 18, 22, 26, 30];

          if (qtyColumns.includes(prop)) {
              const boxColIndex = boxColumns[qtyColumns.indexOf(prop)];
              const boxQty = Math.round(parseFloat(instance.getDataAtCell(row, 5)) || 0); 
              const qty = parseFloat(newValue) || 0;
              const boxValue = boxQty === 0 || qty === 0 ? '' : (qty / boxQty).toFixed(2);
              instance.setDataAtCell(row, boxColIndex, boxValue, 'edit');
          }

          if (prop === 5) { 
              const boxQty = Math.round(parseFloat(instance.getDataAtCell(row, 5)) || 0); 
              qtyColumns.forEach((qtyCol, index) => {
                  const qty = parseFloat(instance.getDataAtCell(row, qtyCol)) || 0;
                  const boxColIndex = boxColumns[index];
                  const boxValue = boxQty === 0 || qty === 0 ? '' : (qty / boxQty).toFixed(2);
                  instance.setDataAtCell(row, boxColIndex, boxValue, 'edit');
              });
          }
        });
        if (source === 'edit' && SaveBtnEnabled) {
          setIsSaveEnabled(true);
          setSaveBtn(false);
          console.log(SaveBtn);
        }
      }
    });

    setHotInstance(instance);

    return () => instance.destroy();
  }, [data, access]);

  return (
    <div className='card'>
      <div className='card-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 className='hanson-title'>Shipping Schedule</h2>
          {SaveBtnEnabled && (
            <FontAwesomeIcon
              icon={faSync}
              onClick={async () => {
                try {
                  setIsRefresh(true);
                  console.log('Initiating Save...');
                  const saveResult = await handleSave(); 
                  console.log('Save Result:', saveResult);
                  setIsRefresh(false);
                  if (saveResult) {
                    console.log('Save Successful. Proceeding to Refresh...');
                    await handleRefresh(); 
                  } else {
                    console.warn('Save Failed. Refresh Aborted.');
                    alert('Save failed. Please resolve issues before refreshing.');
                  }
                } catch (error) {
                  console.error('Error during Save or Refresh:', error);
                  alert('An error occurred during the Save or Refresh process.');
                }
              }}
              style={{ cursor: 'pointer', fontSize: '20px', color: '#4CAF50', fontWeight: 'bold' }}
            />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="controls-container">
          <div style={{ display: 'inline-block' }}>
            <select
              id="week-select"
              value={selectedWeek}
              onChange={handleWeekChange}
              style={{
                padding: '8px',
                paddingRight: "8px",
                borderRadius: '5px',
                border: '1px solid #ccc',
                fontSize: '14px',
                width: '180px',
                marginRight: "12px",
                backgroundColor: "#eee",
                cursor: "pointer"
              }}
            >
              <option value="">Select Week</option>
              {weekOptions.map(week => (
                <option key={week.value} value={week.value}>{week.text}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            hidden = {access !== 3}
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
            hidden = {access !== 3}
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
      </div>
      <div  className="handsontable-wrapper">
        <div id="example" className="custom-table"></div>
      </div>
    </div>
  );
}

export default Page;



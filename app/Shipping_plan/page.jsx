"use client";
import { useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import HyperFormula from 'hyperformula';
import '../handsontable/page.css';
import '../globals.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

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
  let nextId = data.length + 1;

  const staticHeaders = [
    { label: 'Project Details', colspan: 8 }
  ];

  const setWeekHeaders = (startingWeek) => {
    const weekHeaders = Array.from({ length: 6 }, (_, i) => ({
        label: `WK${startingWeek + i}`,
        colspan: 4
    }));

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
        ['Project', 'Part#', 'P.Name', 'Customer', 'Location', 'Box Qty', 'Sale', ...subHeaders]
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
  useEffect(() => {
    const employeeId = localStorage.getItem("username");
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

    if (selectedWeekValue) {
        setSelectedWeek(selectedWeekValue);
        let [weekNumber] = selectedWeekValue.split('-');
        weekNumber = parseInt(weekNumber);

        const updatedNestedHeaders = setWeekHeaders(weekNumber);

        if (hotInstance) {
            hotInstance.updateSettings({
                nestedHeaders: updatedNestedHeaders
            });
            hotInstance.render();
        }

        fetchSaveButtonStatus();
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
  
  const handleSaveChanges = async () => {
    if (!isSaveEnabled || !SaveBtnEnabled) return;
    if (!selectedWeek) {
      alert('Please select a week before saving changes.');
      return;
    }
    
    let [weekNumber, year] = selectedWeek.split('-');
    weekNumber = parseInt(weekNumber);
    year = parseInt(year);
  
    try {
      const displayedData = hotInstance.getData();
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
      } else {
        const errorText = await response.text();
        console.error('Failed to save changes:', errorText);
        alert('Failed to save changes: ' + errorText);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes. Check console for details.');
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

    const invalidColumns = [9, 13, 17, 21, 25, 29];
    if (invalidColumns.includes(col) && (value === '' || isNaN(value) || parseInt(value) != value)) {
      td.style.backgroundColor = 'red';
      td.title = 'Invalid data: Only integers allowed';
    } else {
      td.style.backgroundColor = '';
      td.title = '';
    }

    if (isDarkMode) {
      td.style.backgroundColor = '#333';
      td.style.color = '#f0f0f0';
      td.style.border = '1px solid #555';
      td.style.fontSize = '10px';
    } else {
      td.style.backgroundColor = '#fff';
      td.style.color = '#333';
      td.style.border = '1px solid #ddd';
      td.style.fontSize = '11px';
    }
  };
  
  useEffect(() => {
    const container = document.querySelector('#example');
    const instance = new Handsontable(container, {
      data,
      rowHeaders: true,
      nestedHeaders: setWeekHeaders(parseInt(selectedWeek.split('-')[0]) || 0),
      height: "100%",
      width: "100%",
      rowHeights: 30,
      colWidths: 120,
      autoWrapRow: true,
      autoWrapCol: true,
      licenseKey: 'non-commercial-and-evaluation',
      stretchH: 'all',
      headerTooltips: true,
      columnSorting: true,
      dropdownMenu: ['filter_by_condition', 'filter_by_value', 'filter_action_bar'],
      datePickerConfig: {
        // First day of the week (0: Sunday, 1: Monday, etc)
        firstDay: 1,
        showWeekNumber: true,
      },
      filters: true,
      allowRemoveRow: true,
      allowInsertRow: true,
      allowInsertColumn: false,
      allowRemoveColumn: false,
      fixedColumnsStart: 7,
      contextMenu: true,
      formulas: {
        engine: HyperFormula,
      },
      hiddenColumns: {
        indicators: false,
        columns:[2, 3, 7, 11, 15, 19, 23, 27]
      },
      contextMenu: {
        items: {
          'undo': { name: 'Undo' },
          'redo': { name: 'Redo' },
          'copy': { name: 'Copy' },
          'cut': { name: 'Cut' }
        }
      },
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
        TH.style.background = '#eee';
        TH.style.color = '#68616E';
        TH.style.borderBottom = '1px solid #ccc';
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
      },
      afterCreateRow: (index, amount) => {
        for (let i = 0; i < amount; i++) {
          const rowIndex = index + i;
          instance.setDataAtCell(rowIndex, 0, nextId);
          nextId++;
        }
      },
      columns: [
        { className: 'htLeft htMiddle' ,width: "250%", readOnly: true, dropdownMenu: false }, 
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
        { width: "30%", className: 'htRight htMiddle' }, 
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' },
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
          if ([9, 13, 17, 21, 25, 29].includes(prop)) {
            const boxCol = prop + 1;
            const boxqty = parseFloat(instance.getDataAtCell(row, 5)) || 0;
            const qty = parseFloat(newValue) || 0;
            const boxValue = boxqty === 0 || qty === 0 ? '' : (qty / boxqty).toFixed(2);
            instance.setDataAtCell(row, boxCol, boxValue, 'formula');
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
  }, [data]); // <- , locationOptions

  return (
    <div className='card'>
      <div className='card-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 className='hanson-title'>Shipping Schedule</h2>
          <FontAwesomeIcon
                icon={faSync}
                onClick={handleRefresh}
                style={{ cursor: 'pointer', fontSize: '20px', color: '#4CAF50', fontWeight:'bold' }}
              />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
      </div>
      <div className="handsontable-wrapper">
        <div id="example" className="custom-table"></div>
      </div>
    </div>
  );
}

export default Page;

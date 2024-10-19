"use client";
import { useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import HyperFormula from 'hyperformula';
import '../handsontable/page.css';
import '../globals.css';

function Page({ isDarkMode }) {
  const [data, setData] = useState([['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [weekOptions, setWeekOptions] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  // const [locationOptions, setLocationOptions] = useState([]);
  const [hotInstance, setHotInstance] = useState(null);
  let nextId = data.length + 1;

  const columnHeaders = [
    'Project Name', 'Part No.', 'Part Name', 'Customer', 'Location', 'Box Qty', 'Sale Type',
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

  useEffect(() => {
    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) {
      alert("Please log in to access this page...");
      window.location.href = "/";
      return;
    }
    setIsLoggedIn(true);

    fetch('http://10.40.20.93:300/BTrail/weeks')
      .then(response => response.json())
      .then(fetchedWeekOptions => setWeekOptions(fetchedWeekOptions))
      .catch(error => console.error('Error fetching week options:', error));

    // fetch('http://localhost:5227/Product/locations')
    //   .then(response => response.json())
    //   .then(fetchedLocations => setLocationOptions(fetchedLocations.map(loc => loc.custCountry.trim())))
    //   .catch(error => console.error('Error fetching location options:', error));
  }, []);

  const handleWeekChange = (event) => {
    const selectedWeekValue = event.target.value;

    if (selectedWeekValue === "") {
      setSelectedWeek(selectedWeekValue);
      setData([['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']]);

      if (hotInstance) {
        hotInstance.loadData([['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']]);
        hotInstance.render();
      }
    } else {
      setSelectedWeek(selectedWeekValue);
    }
  };

  useEffect(() => {
    if (selectedWeek) {
      fetchWeekData(selectedWeek);
    }
  }, [selectedWeek]);

  const fetchWeekData = async (weekValue) => {
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
        const fetchedData = await response.json();
        const tableData = fetchedData.map(item => [
          item.projectName,
          item.partNo,
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

  const handleSaveChanges = async () => {
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
          } else {
            rowData[key] = row[index];
          }
        });
        return rowData;
      });
  
      const response = await fetch('http://10.40.20.93:300/BTrail/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableData: formattedData, weekNumber, year }),
      });
  
      if (response.ok) {
        alert('Changes saved successfully!');
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

  const cellRenderer = (instance, td, row, col, prop, value, cellProperties) => {
    const textRenderer = Handsontable.renderers.TextRenderer;
    if (typeof textRenderer === "function") {
      textRenderer.call(this, instance, td, row, col, prop, value, cellProperties);
    }
    if (isDarkMode) {
      td.style.backgroundColor = '#333';
      td.style.color = '#f0f0f0';
      td.style.border = '1px solid #555';
    } else {
      td.style.backgroundColor = '#fff';
      td.style.color = '#333';
      td.style.border = '1px solid #ddd';
    }
  };

  useEffect(() => {
    const container = document.querySelector('#example');
    const instance = new Handsontable(container, {
      data,
      rowHeaders: true,
      nestedHeaders: [
        columnHeaders
      ],
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
      minSpareRows: 0,
      minSpareCols: 0,
      filters: true,
      allowRemoveRow: true,
      allowInsertRow: true,
      allowInsertColumn: false,
      allowRemoveColumn: false,
      fixedColumnsStart: 6,
      contextMenu: true,
      formulas: {
        engine: HyperFormula,
      },
      hiddenColumns: {
        indicators: false
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
        { className: 'htLeft htMiddle' ,width: "300%", readOnly: true, dropdownMenu: false }, { width: "100%", readOnly: true, className: 'htCenter htMiddle' }, { width: "100%", readOnly: true, className: 'htCenter htMiddle' },
        { className: 'htCenter htMiddle', width: "100%", readOnly: true},
        {
          // type: 'dropdown',
          // source: locationOptions,
          readOnly: true,
          width: "80%", 
          className: 'htCenter htMiddle',
        },
        { width: "30%", className: 'htRight htMiddle' }, { width: "4%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, { width: "3%", className: 'htRight htMiddle' }, { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, { width: "3%", className: 'htRight htMiddle' }, { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, { width: "3%", className: 'htRight htMiddle' }, { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, { width: "3%", className: 'htRight htMiddle' }, { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, { width: "3%", className: 'htRight htMiddle' }, { readOnly: true, width: "3%", className: 'htRight htMiddle' },
        { width: "4%", readOnly: true, className: 'htCenter htMiddle' }, { width: "80%", type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true, className: 'htCenter htMiddle' }, { width: "3%", className: 'htRight htMiddle' }, { readOnly: true, width: "3%", className: 'htRight htMiddle' }
      ],
      cells: function (row, col) {
        const cellProperties = {};
        cellProperties.renderer = cellRenderer;
        return cellProperties;
      },
      cells: function (row, col) {
        const cellProperties = {};
        cellProperties.renderer = cellRenderer;
        if (col < 6) {
            cellProperties.className = 'fixed-column-shadow';
        }

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
      }
    });

    setHotInstance(instance);

    return () => instance.destroy();
  }, [data]); // <- , locationOptions

  return (
    <div className='card'>
      <div className='card-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className='hanson-title'>Shipping Schedule</h2>
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
          <button
            className='save-button'
            onClick={handleSaveChanges}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
      <div className="handsontable-wrapper">
        <div id="example" className="custom-table"></div>
      </div>
    </div>
  );
}

export default Page;

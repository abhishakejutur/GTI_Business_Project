"use client";
import { useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import HyperFormula from 'hyperformula';
import '../handsontable/page.css';
import '../globals.css';

function Page({ isDarkMode }) {
  const [data, setData] = useState([
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  let hotInstance;
  let nextId = data.length + 1;

  const columnHeaders = [
    'ID', 'Product ID', 'Project Name', 'Part No.', 'Part Name', 'Customer', 'Location', 'Sale Type',
    'Week No.', 'Date', 'QTY .', 'Box', 'Week No.', 'Date', 'QTY .', 'Box',
    'Week No.', 'Date', 'QTY .', 'Box', 'Week No.', 'Date', 'QTY .', 'Box',
    'Week No.', 'Date', 'QTY .', 'Box', 'Week No.', 'Date', 'QTY .', 'Box'
  ];

  const columnKeys = [
    'id', 'product_Id', 'projectName', 'partNo', 'partName', 'customer', 'custLoc', 'saleType',
    'week1', 'date1', 'qty1', 'box1', 'week2', 'date2', 'qty2', 'box2',
    'week3', 'date3', 'qty3', 'box3', 'week4', 'date4', 'qty4', 'box4',
    'week5', 'date5', 'qty5', 'box5', 'week6', 'date6', 'qty6', 'box6'
  ];

  const alphabeticHeaders = () => {
    return columnHeaders.map((_, index) => {
      let letter = '';
      while (index >= 0) {
        letter = String.fromCharCode((index % 26) + 65) + letter;
        index = Math.floor(index / 26) - 1;
      }
      return letter;
    });
  };

  useEffect(() => {
    const employeeId = localStorage.getItem("employeeId");

    if (!employeeId) {
      alert("Please log in to access this page...");
      window.location.href = "/";
      return;
    }

    setIsLoggedIn(true);

    fetch('http://localhost:5227/BTrail')
      .then(response => response.json())
      .then(fetchedData => {
        const tableData = fetchedData.map(item => [
          item.id,
          item.product_Id,
          item.projectName,
          item.partNo,
          item.partName,
          item.customer,
          item.custLoc,
          item.saleType,
          item.week1,
          formatDateForDisplay(item.date1),
          item.qty1,
          item.box1,
          item.week2,
          formatDateForDisplay(item.date2),
          item.qty2,
          item.box2,
          item.week3,
          formatDateForDisplay(item.date3),
          item.qty3,
          item.box3,
          item.week4,
          formatDateForDisplay(item.date4),
          item.qty4,
          item.box4,
          item.week5,
          formatDateForDisplay(item.date5),
          item.qty5,
          item.box5,
          item.week6,
          formatDateForDisplay(item.date6),
          item.qty6,
          item.box6
        ]);

        setData(tableData.length ? tableData : data);
        nextId = tableData.length + 1;
      })
      .catch(error => console.error(error));
  }, []);

  const handleSaveChanges = async () => {
    try {
      const displayedData = hotInstance.getData();

      const formattedData = displayedData.map(row => {
        const rowData = {};
        columnKeys.forEach((key, index) => {
          if (key.includes('date')) {
            rowData[key] = row[index] === '00/00/0000' ? null : formatDateForBackend(row[index]);
          } else {
            rowData[key] = row[index];
          }
        });
        return rowData;
      });

      const response = await fetch('http://localhost:5227/BTrail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        alert('Changes saved successfully!');
        window.location.reload();
      } else {
        alert('Failed to save changes.');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes.');
    }
  };

  const formatDateForBackend = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '00/00/0000';
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

    hotInstance = new Handsontable(container, {
      data,
      rowHeaders: true,
      nestedHeaders: [
        alphabeticHeaders(),
        columnHeaders
      ],
      height: "100%",
      width: "100%",
      rowHeights: 5,
      colWidths: 120,
      autoWrapRow: true,
      autoWrapCol: true,
      licenseKey: 'non-commercial-and-evaluation',
      stretchH: 'all',
      headerTooltips: true,
      columnSorting: true,
      dropdownMenu: ['make_read_only', 'alignment', 'filter_by_condition', 'filter_by_value', 'filter_action_bar'],
      minSpareRows: 0,
      minSpareCols: 0,
      filters: true,
      allowRemoveRow: false,
      allowInsertRow: false,
      allowInsertColumn: false,
      allowRemoveColumn: false,
      fixedColumnsStart: 6,
      contextMenu: true,
      formulas: {
        engine: HyperFormula,
      },
      hiddenColumns: {
        columns: [0, 1], // Hides ID and Product ID
        indicators: false
      },
      afterGetColHeader: function (col, TH) {
        TH.style.background = '#eee';
        TH.style.color = '#333';
        TH.style.borderBottom = '2px solid #ccc';
      },
      afterOnCellMouseOver: function (event, coords, TD) {
        if (coords.row >= 0) {
          TD.style.background = '#f1f1f1';
        }
      },
      afterOnCellMouseOut: function (event, coords, TD) {
        if (coords.row >= 0) {
          TD.style.background = '';
        }
      },
      afterCreateRow: (index, amount) => {
        for (let i = 0; i < amount; i++) {
          const rowIndex = index + i;
          hotInstance.setDataAtCell(rowIndex, 0, nextId);
          nextId++;
        }
      },
      columns: [
        { readOnly: true, width: "2%" }, { readOnly: true, width: "5%" },
        { width: "300%" }, { width: "100%" }, { width: "100%" }, { width: "100%" }, { width: "3%" }, { width: "4%" },
        { width: "4%" }, { type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true }, { width: "3%" }, {},
        { width: "4%" }, { type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true }, { width: "3%" }, {},
        { width: "4%" }, { type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true }, { width: "3%" }, {},
        { width: "4%" }, { type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true }, { width: "3%" }, {},
        { width: "4%" }, { type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true }, { width: "3%" }, {},
        { width: "4%" }, { type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true }, { width: "3%" }, {}
      ],
      cells: function (row, col) {
        const cellProperties = {};
        cellProperties.renderer = cellRenderer;
        return cellProperties;
      },
    });

    return () => hotInstance.destroy();
  }, [data, isDarkMode]);

  return (
    <div className='card'>
      <div className='card-header'>
        <h2 className='hanson-title'>Shipping Schedule</h2>
        <button className='save-button' onClick={handleSaveChanges}>
          Save Changes
        </button>
      </div>
      <div className="handsontable-wrapper">
        <div id="example" className="custom-table"></div>
      </div>
    </div>
  );
}

export default Page;

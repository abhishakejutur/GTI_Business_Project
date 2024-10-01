"use client";
import { useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import HyperFormula from 'hyperformula'; 
import '../handsontable/page.css';
import '../globals.css';

function Page({ isDarkMode }) {
  const [data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const columnHeaders = [
    'Project',
    'Part No.',
    'Part Name',
    'Customer',
    'Location',
    'Sale Type',
    'Week No.',
    'Date',
    'QTY .',
    'Box',
    'Week No.',
    'Date',
    'QTY .',
    'Box',
    'Week No.',
    'Date',
    'QTY .',
    'Box',
    'Week No.',
    'Date',
    'QTY .',
    'Box',
    'Week No.',
    'Date',
    'QTY .',
    'Box',
    'Week No.',
    'Date',
    'QTY .',
    'Box',
  ];

  const statusOptions = [0, 1, 2, 3, 4]; 

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
    fetch('')
      .then(response => response.json())
      .then(data => {
        const tableData = data.map(item => [
          
        ]);
        setData(tableData);
      })
      .catch(error => console.error(error));
  }, []);

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

    const hotInstance = new Handsontable(container, {
      data,
      rowHeaders: true,
      nestedHeaders: [
        alphabeticHeaders(), 
        columnHeaders        
      ],
      height: "100%", 
      width: "100%",
      rowHeights: 35,
      colWidths: 170,
      autoWrapRow: true,
      autoWrapCol: true,
      licenseKey: 'non-commercial-and-evaluation',
      stretchH: 'all',
      headerTooltips: true,
      columnSorting: true, 
      dropdownMenu: true,  
      filters: true,      
      contextMenu: true,   
      formulas: {
        engine: HyperFormula, 
      },
      afterGetColHeader: function(col, TH) {
        TH.style.background = '#eee'; 
        TH.style.color = '#333'; 
        TH.style.borderBottom = '2px solid #ccc'; 
      },
      afterOnCellMouseOver: function(event, coords, TD) {
        if (coords.row >= 0) {
          TD.style.background = '#f1f1f1'; 
        }
      },
      afterOnCellMouseOut: function(event, coords, TD) {
        if (coords.row >= 0) {
          TD.style.background = ''; 
        }
      },
      columns: [
        { readOnly: true }, 
        {},
        {
          type: 'dropdown',
          source: statusOptions, 
          allowInvalid: false,
        }, 
        {}, {}, {}, 
        {width:"6%"}, {type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true}, {}, {}, 
        {width:"6%"}, {type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true}, {}, {}, 
        {width:"6%"}, {type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true}, {}, {}, 
        {width:"6%"}, {type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true}, {}, {}, 
        {width:"6%"}, {type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true}, {}, {}, 
        {width:"6%"}, {type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true}, {}, {}, 
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
      </div>
      <div className="handsontable-wrapper">
        <div id="example" className="custom-table"></div>
      </div>
    </div>
  );
}

export default Page;

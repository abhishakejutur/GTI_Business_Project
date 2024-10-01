"use client";
import { useEffect, useState } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import HyperFormula from 'hyperformula'; 
import './page.css';
import '../globals.css';

function Page({ isDarkMode }) {
  const [data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const columnHeaders = [
    'Product ID',
    'Project',
    'Status',
    'Customer',
    'Part Description',
    'Cast RR',
    'Mach RR',
    'Assy RR',
    'Location',
    'Material',
    'Material Rev',
    'Cast Part No',
    'Cast Dwg Rev',
    'Cast Part Rev',
    'Cast Wt',
    'Cast Approval',
    'Mach Part No',
    'Mach Dwg Rev',
    'Mach Part Rev',
    'Mach Wt',
    'Mach Approval',
    'Assy Part No',
    'Assy Dwg Rev',
    'Assy Part Rev',
    'Assy Wt',
    'Assy Approval',
    'Ship Part No',
    'HS Part No',
    'Project Status',
    'SOP Date',
    'PMPD',
    'Sale Type',
    'Install Capacity',
    'Box Qty',
    'Created By',
    'Updated By',
    'Created Date',
    'Updated Date',
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
      alert("Please log in to access this page.");
      window.location.href = "/";
      return;
    }

    setIsLoggedIn(true);
    fetch('http://10.40.20.98:82/api/Productmatrix')
      .then(response => response.json())
      .then(data => {
        const tableData = data.map(item => [
          item.product_Id,
          item.project,
          item.status,
          item.customer,
          item.partDesc,
          item.castRR,
          item.machRR,
          item.assyRR,
          item.location,
          item.material,
          item.matl_Rev,
          item.cast_PartNo,
          item.cast_Dwg_Rev,
          item.cast_Part_Rev,
          item.cast_Wt,
          item.cast_Appr,
          item.mach_PartNo,
          item.mach_Dwg_Rev,
          item.mach_Part_Rev,
          item.mach_Wt,
          item.mach_Appr,
          item.assy_PartNo,
          item.assy_Dwg_Rev,
          item.assy_Part_Rev,
          item.assy_Wt,
          item.assy_Appr,
          item.ship_PartNo,
          item.hS_PartNo,
          item.proj_Status,
          item.soP_Date,
          item.pmpd,
          item.saletype,
          item.installCapa,
          item.boxqty,
          item.createdBy,
          item.updatedBy,
          item.createdDate,
          item.updatedDate,
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
        {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
        { type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true },
        {}, {}, {}, {}, {}, {},
        { type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true },
        { type: 'date', dateFormat: 'MM/DD/YYYY', correctFormat: true }, 
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
        <h2 className='hanson-title'>Product Matrix</h2>
      </div>
      <div className="handsontable-wrapper">
        <div id="example" className="custom-table"></div>
      </div>
    </div>
  );
}

export default Page;

"use client";
import { useEffect, useState, useRef } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import HyperFormula from 'hyperformula';
import '../handsontable/page.css';
import '../globals.css';

function Page({ isDarkMode }) {
  const [data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hotInstanceRef = useRef(null);
  const containerRef = useRef(null);

  const columnHeaders = [
    'Id', 'Customer', 'Project Name', 'Desc', 'Cast PartNo', 'Mach PartNo', 'Assy PartNo', 'Material',
    'Cast_wt', 'Month', 'Year'
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth + i) % 12;
    const year = currentYear + Math.floor((currentMonth + i) / 12);
    const monthYear = `${months[monthIndex]}'${year.toString().slice(2)}`;
    columnHeaders.push(monthYear);
  }

  const columnKeys = [
    'product_Id', 'customer', 'projectName', 'projectDesc', 'cast_PartNo', 'mach_PartNo', 'assy_PartNo', 'idm',
    'cast_wt', 'month_No', 'year_No', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'
  ];

  useEffect(() => {
    const employeeId = localStorage.getItem("employeeId");
    if (!employeeId) {
      alert("Please log in to access this page...");
      window.location.href = "/";
      return;
    }
    setIsLoggedIn(true);
    // fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const body = JSON.stringify({
        Month_No: currentMonth + 1,
        Year_No: currentYear
      });

      const response = await fetch(`http://10.40.20.93:300/customerForecast?Month_No=${currentMonth + 1}&Year_No=${currentYear}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body
      });

      if (response.ok) {
        const fetchedData = await response.json();
        console.log("API Response: ", fetchedData," parameter-->", currentMonth + 1, "-----" ,currentYear);

        const tableData = fetchedData.map(item => [
          item.product_Id,
          item.customer,
          item.projectName,
          item.projectDesc,
          item.cast_PartNo,
          item.mach_PartNo,
          item.assy_PartNo,
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
  const handleSaveChanges = async () => {
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
        monthNo: currentMonth + 1,
        yearNo: currentYear,
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
        alert(result.message);
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
    if (!containerRef.current) return;

    const instance = new Handsontable(containerRef.current, {
      data,
      rowHeaders: true,
      nestedHeaders: [columnHeaders],
      height: "100%",
      width: "100%",
      rowHeights: 30,
      colWidths: 120,
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
      fixedColumnsStart: 7,
      contextMenu: true,
      formulas: { engine: HyperFormula },
      hiddenColumns: { indicators: false, columns: [0 , 8, 9, 10] },
      columns: [
        { width: "5%", readOnly: true, className: 'htLeft htMiddle'},
        { width: "98%", readOnly: true, className: 'htLeft htMiddle' },
        { width: "250%", readOnly: true, className: 'htLeft htMiddle' },
        { width: "5%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "70%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "70%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "70%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "170%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "5%", readOnly: true, className: 'htRight htMiddle' },
        { width: "10%", readOnly: true, className: 'htCenter htMiddle' },
        { width: "10%", readOnly: true, className: 'htCenter htMiddle' },
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
        { width: "10%", className: 'htRight htMiddle', type: 'numeric', numericFormat: { pattern: '###,00' } },
      ],
      cells: (row, col) => {
        return {
          renderer: cellRenderer,
        };
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
        <h2 className='hanson-title'>Customer Forecast</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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
        <div ref={containerRef} id="example" className="custom-table"></div>
      </div>
    </div>
  );
}

export default Page;
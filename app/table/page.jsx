"use client";
import React, { useEffect, useRef, useState } from 'react';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import jspreadsheet from 'jspreadsheet-ce';
import './page.css';
// import '../components/UI.css';

const Spreadsheet = () => {
  const spreadsheetRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://10.40.20.98:82/api/Productmatrix');
        const result = await response.json();

        const formattedData = result.map(item => [
          item.product_Id,
          item.project,
          item.status,
          item.customer,
          item.partDesc,
          item.castRR,
          item.machRR,
          item.location,
          item.material,
          item.cast_PartNo,
        ]);

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const applyStyles = (table) => {
    const isDarkMode = document.body.classList.contains('dark');
    const textColor = isDarkMode ? '#f0f0f0' : '#333';
    const hoverColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const backgroundColor = isDarkMode ? '#333' : '#fff';
    const headerBackgroundColor = isDarkMode ? '#444' : '#eee';

    table.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    table.style.backgroundColor = backgroundColor;
    table.style.width = '100%';

    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
      cell.style.padding = '16px';
      cell.style.transition = 'background-color 0.3s, transform 0.2s';
      cell.style.backgroundColor = 'transparent';
      cell.style.color = textColor;
      cell.style.borderBottom = `1px solid rgba(0, 0, 0, 0.1)`;
      cell.style.borderRadius = '5px';

      cell.addEventListener('mouseenter', () => {
        cell.style.backgroundColor = hoverColor;
        cell.style.transform = 'scale(1.02)';
      });
      cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = 'transparent';
        cell.style.transform = 'scale(1)';
      });
    });
  };

  useEffect(() => {
    if (data.length > 0) {
      const spreadsheet = jspreadsheet(spreadsheetRef.current, {
        data: data,
        columns: [
          { type: 'numeric', title: 'Product ID', width: 90 },
          { type: 'text', title: 'Project', width: 150 },
          { type: 'dropdown', title: 'Status', width: 90, source: ['1', '2', '3', '4'] },
          { type: 'text', title: 'Customer', width: 120 },
          { type: 'text', title: 'Part Description', width: 150 },
          { type: 'numeric', title: 'Cast RR', width: 80 },
          { type: 'numeric', title: 'Mach RR', width: 80 },
          { type: 'text', title: 'Location', width: 100 },
          { type: 'text', title: 'Material', width: 80 },
          { type: 'text', title: 'Cast Part No', width: 120 },
        ],
        allowEditing: true,
        allowDragging: true,
        allowInsertRow: true,
        allowDeleteRow: true,
        rowHeight: 50,
        headerHeight: 50,
      });

      setTimeout(() => {
        const table = spreadsheetRef.current.querySelector('table');
        if (table) {
          table.style.borderRadius = '10px';
          table.style.overflowX = 'auto'; // Enable horizontal scroll
          table.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';

          // Apply sticky header and responsive table adjustments
          const headers = table.querySelectorAll('th');
          headers.forEach(header => {
            header.style.backgroundColor = headerBackgroundColor;
            header.style.color = '#fff';
            header.style.borderBottom = `2px solid rgba(0, 0, 0, 0.1)`;
            header.style.fontSize = '16px';
            header.style.padding = '16px';
            header.style.position = 'sticky';
            header.style.top = '0';
            header.style.zIndex = '10';
          });

          applyStyles(table);
        }
      }, 0);

      return () => {
        spreadsheet.destroy();
      };
    }
  }, [data]);

  return (
    <div className="spreadsheet-container">
      <h1 className="spreadsheet-title">Product Matrix</h1>
      <div
        ref={spreadsheetRef}
        className="spreadsheet"
        style={{ overflow: 'auto', maxHeight: '600px', width: '100%' }} // Ensure full width for responsiveness
      ></div>
    </div>
  );
};

export default Spreadsheet;

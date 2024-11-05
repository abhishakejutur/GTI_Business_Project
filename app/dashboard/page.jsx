"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudDownloadAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "./page.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formatNumberInternationalStyle = (num) => {
  if (num === null || num === undefined) return null;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const Page = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [columns, setColumns] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const employeeId = localStorage.getItem("username");
    if (!employeeId) {
      window.location.href = "/";
      return;
    }
    setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    fetchData(month, year);
    generateColumns(month, year);
  }, [selectedDate]);

  const fetchData = async (month, year) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/dashboard?Month=${month}&Year=${year}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const generateColumns = (startMonth, startYear) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    let columns = [];
    let currentMonth = startMonth - 1;
    let currentYear = startYear;

    for (let i = 0; i < 12; i++) {
      columns.push(`${months[currentMonth]} ${currentYear.toString().slice(-2)}`);
      currentMonth++;
      if (currentMonth === 12) {
        currentMonth = 0;
        currentYear++;
      }
    }
    setColumns(columns);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    fetchData(month, year);
    generateColumns(month, year);
  };

  const getRowBackgroundColor = (index) => {
    if (index === 18) return { backgroundColor: 'lightgreen' };
    if ((index + 1) % 3 === 1) return { backgroundColor: '#b1bed5' };
    if ((index + 1) % 3 === 2) return { backgroundColor: '#bfd8d5' };
    if ((index + 1) % 3 === 0) return { backgroundColor: '#dfdfdf' };
    return {};
  };

  return (
    <div className="dashboard">
      <div className="head-title">
        <div className="left">
          {/* <h1 style={{ fontSize: '24px' }}>Dashboard</h1> */}
          <ul className="breadcrumb">
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faChevronRight} />
            </li>
            <li>
              <a className="active" href="/dashboard">Estimated Business</a>
            </li>
          </ul>
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
      </div>

      <div className="table-data" style={{ backgroundColor: 'transparent' }}>
        <div className="order" style={{ backgroundColor: 'transparent' }}>
          <div className="table-scroll" style={{
            overflowX: 'auto',
            borderRadius: '10px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            width: '100%', 
            maxWidth: '100%',
            whiteSpace: 'nowrap',
          }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px' }}>
              <thead style={{ position: 'sticky', top: '0', backgroundColor: 'white' }}>
                <tr style={{ backgroundColor: '#eee' }}>
                  <th colSpan="2" style={{ textAlign: 'center', backgroundColor: 'grey', color: 'white', borderRight: '3px solid #eee' }} id="material">Estimated Business</th>
                  {columns.map((col, index) => (
                    <th style={{ backgroundColor: 'grey', color: 'white' }} id="data" key={index}>{col}</th>
                  ))}
                  <th style={{ backgroundColor: 'grey', color: 'white' }} id="data">Average</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const values = [
                    item.a, item.b, item.c, item.d, item.e,
                    item.f, item.g, item.h, item.i, item.j,
                    item.k, item.l
                  ];

                  const average = values.reduce((sum, value) => sum + (value || 0), 0) / values.length;
                  const rowStyle = getRowBackgroundColor(index);
                  const borderBottomStyle = (index + 1) % 3 === 0 ? { borderBottom: '4px solid #eee' } : {};

                  return (
                    <tr key={index} style={{ ...rowStyle, ...borderBottomStyle }}>
                      <td
                        id="material"
                        style={{
                          textAlign: 'right',                         
                          fontWeight: 'bold',
                          borderRadius: '10px 0 0 10px',
                          paddingLeft:'15px'
                        }}
                      >
                        {item.material}
                      </td>
                      <td
                        id="RW"
                        style={{
                          padding: '10px',
                          borderRight: '3px solid #eee'
                        }}
                      >
                        {item.required_Weights}
                      </td>
                      {values.map((value, i) => (
                        <td key={i} id="data" style={{ padding: '10px' }}>
                          {value === 0 ? '' : formatNumberInternationalStyle(value)}
                        </td>
                      ))}
                      <td id="data" style={{ padding: '10px' }}>{Math.round(average) === 0 ? '' : formatNumberInternationalStyle(Math.round(average))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

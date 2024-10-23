"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudDownloadAlt, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "./page.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Page = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [columns, setColumns] = useState([]);

  const fetchData = async (month, year) => {
    console.log(`Fetching data for Month: ${month}, Year: ${year}`);
    try {
      const response = await fetch(`http://10.40.20.93:300/dashboard?Month=${month}&Year=${year}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      });
      
      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      if (result.length === 0) {
        console.warn("No data found for the provided month and year.");
      } else {
        console.log("Data fetched successfully:", result);
      }
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
    const month = date.getMonth()+1; 
    console.log(month);
    const year = date.getFullYear();
    console.log(year);
    fetchData(month, year);
    generateColumns(month, year);
  };

  useEffect(() => {
    if (selectedDate) {
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      generateColumns(month, year);
    }
  }, [selectedDate]);

  return (
    <div className="dashboard">
      <div className="head-title">
        <div className="left">
          <h1 style={{fontSize:'24px'}}>Dashboard</h1>
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
        <a href="#" className="btn-download">
          <FontAwesomeIcon icon={faCloudDownloadAlt} />
          <span className="text">Download PDF</span>
        </a>
      </div>

      <div className="table-data">
        <div className="order">
          <div className="head">
            <h3 style={{fontSize:'24px'}}>Estimated Business</h3>
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
          </div><br /><br />
          <div className="table-scroll">
          <table className="styled-table">
            <thead>
              <tr>
                <th id="RW">Required_Weights</th>
                <th id="material">Material</th>
                {columns.map((col, index) => (
                  <th id="data" key={index}>{col}</th>
                ))}
                <th id="data">Average</th>
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
              
                return (
                  <tr key={index}>
                    <td id="RW">{item.required_Weights}</td>
                    <td id="material">{item.material}</td>
                    <td id="data">{item.a || null}</td>
                    <td id="data">{item.b || null}</td>
                    <td id="data">{item.c || null}</td>
                    <td id="data">{item.d || null}</td>
                    <td id="data">{item.e || null}</td>
                    <td id="data">{item.f || null}</td>
                    <td id="data">{item.g || null}</td>
                    <td id="data">{item.h || null}</td>
                    <td id="data">{item.i || null}</td>
                    <td id="data">{item.j || null}</td>
                    <td id="data">{item.k || null}</td>
                    <td id="data">{item.l || null}</td>
                    <td id="data">{average.toFixed(2)}</td>
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

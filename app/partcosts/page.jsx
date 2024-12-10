"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './page.css';
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPencil,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = useState("Part Costs");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tableData, setTableData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showInsertPopup, setShowInsertPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [usdValue, setUsdValue] = useState("");
  const [partOptions, setPartOptions] = useState([]);
  const [partOptionsForInsert, setPartOptionsForInsert] = useState([]);
  const [selectedPart, setSelectedPart] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [dropdownSuggestions, setDropdownSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [formData, setFormData] = useState({
    shippingPn: selectedPart || "",
    currUnit: "",
    rateUSD: 0.00,
    forex: 0.00,
    rateINR: 0.00,
  });
  const [accessData, setAccessData] = useState([]);
  const [access, setAccess] = useState();
  const [userEdit, setUserEdit] = useState(false);

  

  useEffect(() => {
    const employeeId = localStorage.getItem("username");
    const empid = localStorage.getItem("employeeId");
    if (!employeeId) {
      window.location.href = "/";
      return;
    }
    fetchPartCostsData();
    fetchEmployeeAccess(empid);
  }, []);

  useEffect(() => {
    if (accessData.length > 0) {
      const accessLevel = getAccessForPage("PartCosts");
      setAccess(accessLevel);
      // setDashboardAccess(access===3)
      setUserEdit(access===3)
      console.log("access number : ", access, "access Level : ", accessLevel);
      console.log("access type : ",typeof(access))
      console.log("admin : ", access === 3);
      if (accessLevel === 0) {
        window.location.href = "/dashboard";
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
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setActiveIndex(-1); 

    if (!value.trim()) {
      setFilteredTableData(tableData);
      setDropdownSuggestions([]);
      return;
    }

    const lowerCaseValue = value.toLowerCase();
    const filteredData = tableData.filter(
      (row) =>
        row.project.toLowerCase().includes(lowerCaseValue) ||
        row.shipping_pn.toLowerCase().includes(lowerCaseValue) ||
        row.curr_unit.toLowerCase().includes(lowerCaseValue)
    );
    setFilteredTableData(filteredData);

    const suggestions = Array.from(
      new Set(
        tableData
          .flatMap((row) => [row.project, row.shipping_pn, row.curr_unit])
          .filter((item) => item.toLowerCase().includes(lowerCaseValue))
      )
    );
    setDropdownSuggestions(suggestions);
  };

  const handleKeyDown = (event) => {
    if (!dropdownSuggestions.length) return;
  
    if (event.key === "ArrowDown") {
      event.preventDefault(); 
      setActiveIndex((prevIndex) => (prevIndex + 1) % dropdownSuggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault(); 
      setActiveIndex((prevIndex) =>
        prevIndex === -1 ? dropdownSuggestions.length - 1 : (prevIndex - 1 + dropdownSuggestions.length) % dropdownSuggestions.length
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < dropdownSuggestions.length) {
        const selectedSuggestion = dropdownSuggestions[activeIndex];
        setSearchTerm(selectedSuggestion);
        handleSearchChange(selectedSuggestion);
        setDropdownSuggestions([]); 
        setActiveIndex(-1); 
      }
    }
  };
  
  useEffect(() => {
    async function fetchPartOptions() {
      try {
        const response = await fetch("http://10.40.20.93:300/partNos?flag=false");
        const data = await response.json();
        setPartOptions(data);
        console.log("Fetched Part no. data:", data);
      } catch (error) {
        console.error("Error fetching part options:", error);
      }
    }

    fetchPartOptions();
  }, []);

  const fetchPartOptionsForInsert = async () => {
    try {
      const response = await fetch("http://10.40.20.93:300/partNos?flag=true");
      const data = await response.json();
      setPartOptionsForInsert(data);
      console.log("Fetched Part no. data for insert:", data);
    } catch (error) {
      console.error("Error fetching part options for insert:", error);
    }
  };
  const fetchPartOptions = async () => {
    try {
      const response = await fetch("http://10.40.20.93:300/partNos?flag=false");
      const data = await response.json();
      setPartOptionsForInsert(data);
      console.log("Fetched Part no. data for insert:", data);
    } catch (error) {
      console.error("Error fetching part options for insert:", error);
    }
  };

  const fetchPartData = async (partNo) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/GetDataBypartNos?partNo=${partNo}`);
      const [data] = await response.json();
  
      if (!data) {
        console.warn(`No data found for part number: ${partNo}`);
        setFormData({
          shippingPn: partNo,
          project: "",
          currUnit: "",
          rateUSD: 0.00,
          forex: 0.00,
          rateINR: 0.00,
        });
        return;
      }
  
      setFormData({
        shippingPn: partNo,
        project: data.project || "",
        currUnit: data.curr_unit || "",
        rateUSD: data.rate_USD || 0.00,
        forex: data.forex || 0.00,
        rateINR: data.rate_INR || 0.00,
      });
  
      setSelectedPart(partNo);
    } catch (error) {
      console.error("Error fetching part data:", error);
      setFormData({
        shippingPn: partNo,
        project: "",
        currUnit: "",
        rateUSD: 0.00,
        forex: 0.00,
        rateINR: 0.00,
      });
    }
  };
  
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [field]: value };
      if (field === "currUnit") {
        if (value === "INR") {
          updatedData.rateUSD = 0;
          updatedData.forex = 0;
          updatedData.rateINR = 0;
        } else if (value === "USD") {
          updatedData.rateUSD = 0;
          updatedData.forex = 0;
          updatedData.rateINR = 0;
        }
      }
      if (field === "rateUSD" || field === "forex") {
        const rateUSD = parseFloat(updatedData.rateUSD || 0);
        const forex = parseFloat(updatedData.forex || 0);
        if (!isNaN(rateUSD) && !isNaN(forex)) {
          updatedData.rateINR = (rateUSD * forex).toFixed(2);
        }
      }
      return updatedData;
    });
  };
  
  const saveChanges = async () => {
    try {
      const response = await fetch(
        `http://10.40.20.93:300/partCosts/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Failed to update PartCosts");
      console.log("PartCosts updated successfully");
      setShowPopup(false);
    } catch (error) {
      console.error("Error updating PartCosts:", error);
    }
  };
  const togglePopup = async () => {
    setShowInsertPopup(false);
    setShowDeletePopup(false);
    setShowPopup((prev) => !prev);
    setSelectedPart("");
        // setPartOptionsForInsert([]);
        setFormData({
          shippingPn: "",
          currUnit: "",
          rateUSD: "",
          forex: "",
          rateINR: "",
        });
  };
  const togglePopupInsert = async () => {
    setShowPopup(false);
    setShowDeletePopup(false);
    setShowInsertPopup((prev) => !prev);
    setSelectedPart("");
        // setPartOptionsForInsert([]);
        setFormData({
          shippingPn: "",
          currUnit: "",
          rateUSD: "",
          forex: "",
          rateINR: "",
        });
  };
  const togglePopupDelete = async () => {
    setShowInsertPopup(false);
    setShowPopup(false);
    setShowDeletePopup((prev) => !prev);
    setSelectedPart("");
        // setPartOptionsForInsert([]);
        setFormData({
          shippingPn: "",
          currUnit: "",
          rateUSD: "",
          forex: "",
          rateINR: "",
        });
  };
  
  const savePopupData = async () => {
    try {
      const response = await fetch(`http://10.40.20.93:300/partCosts/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(popupData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update PartCosts");
      }
  
      console.log("PartCosts updated successfully");
      await fetchPartCostsData();
      alert("Data updated successfully.");
    } catch (error) {
      console.error("Error updating PartCosts:", error);
      alert("Failed to update PartCosts.");
    }
    setShowPopup(false);
  };
  const handlePopupChange = (key, value) => {
    setPopupData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUsdChange = (event) => {
    setUsdValue(event.target.value);
  };


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Estimate Shipping Schedule") {
      initializeShippingScheduleData();
      setColumns([]);
    } else if (tab === "Estimated Business") {
      generateDynamicColumns(selectedDate);
    } else if (tab === "Part Costs") {
      fetchPartCostsData();
    }
  };
  
  const formatNumber = (num) => {
    const parsedNum = parseFloat(num);
    console.log("Formatting number:", num, "=>", parsedNum); 
    if (!isNaN(parsedNum)) {
      return parsedNum.toLocaleString('en-US');
    }
    return "0";
  };
  const getRowBackgroundColorTab4 = (index) => {
    const colors = [
      'white',
      '#E1F8DC'
    ];
    const rowStyle = { backgroundColor: colors[index % colors.length] };
    
    return rowStyle;
  };
  const fetchPartCostsData = async () => {
    try {
      const response = await fetch('http://10.40.20.93:300/partCosts');
      const result = await response.json();
      console.log("Fetched Part Costs data:", result);
      setTableData(result);
      setFilteredTableData(result);
    } catch (error) {
      console.error("Error fetching Part Costs data:", error);
    }
  };
  const commonInputStyle = {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "2px solid #ccc",
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
  };
  
  const USDPopup = async () => {
    try {
      const response = await fetch(`http://10.40.20.93:300/partCosts/update?USD=${usdValue}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update PartCosts");
      }
      console.log("PartCosts updated successfully");

      await fetchPartCostsData();
      // alert("USD value saved and table updated successfully.");
    } catch (error) {
      console.error("Error updating PartCosts:", error);
      alert("Failed to update PartCosts.");
    }
    setShowPopup(false);
  };
  const handleInsert = async () => {
    if (!selectedPart) {
      alert("Please select a part before inserting.");
      return;
    }
  
    const preparedFormData = {
      ...formData,
      shippingPn: selectedPart,
    };
  
    try {
      console.log("Inserting part cost with data:", preparedFormData);
      const response = await fetch("http://10.40.20.93:300/partCosts/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preparedFormData),
      });
  
      const responseBody = await response.json();
      console.log("API response:", responseBody);
  
      if (!response.ok) {
        console.error("API Error:", responseBody);
        alert(`Failed to insert part cost: ${responseBody.title || "Unknown error"}`);
        return;
      }
  
    //   alert("Part cost inserted successfully.");
      setShowInsertPopup(false);
      fetchPartCostsData(); 
      await fetchPartOptions();
      await fetchPartOptionsForInsert();
      window.location.reload();
    } catch (error) {
      console.error("Error inserting part cost:", error);
      alert("Failed to insert part cost. Please try again.");
    }
  };
  

  const handleEdit = async () => {
    try {
      const response = await fetch("http://10.40.20.93:300/partCosts/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update part cost");
    //   alert("Part cost updated successfully.");
      setShowPopup(false);
      fetchPartCostsData();
      await fetchPartOptions();
      await fetchPartOptionsForInsert();
    } catch (error) {
      console.error("Error updating part cost:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://10.40.20.93:300/partCosts/delete?shippingPn=${selectedPart}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete part cost");
    //   alert("Part cost deleted successfully.");
      setShowDeletePopup(false);
      fetchPartCostsData();
      await fetchPartOptions();
      await fetchPartOptionsForInsert();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting part cost:", error);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '100%', padding: '20px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="tab-container" style={{ display: 'flex', borderBottom: '1px solid #ddd', marginTop: '10px', marginBottom: '1px' }}>
        <button hidden
          className={`tab-button ${activeTab === "Estimated Business" ? "active" : ""}`}
          onClick={() => handleTabChange("Estimated Business")}
          style={{
            padding: '10px 20px',
            fontWeight: 'bold',
            backgroundColor: activeTab === "Estimated Business" ? '#007bff' : 'white',
            color: activeTab === "Estimated Business" ? '#fff' : '#000',
            borderTopLeftRadius: '8px',
          }}
        >
          Estimated Business
        </button>
        <button hidden
          className={`tab-button ${activeTab === "Estimate Shipping Schedule" ? "active" : ""}`}
          onClick={() => handleTabChange("Estimate Shipping Schedule")}
          style={{
            padding: '10px 20px',
            fontWeight: 'bold',
            backgroundColor: activeTab === "Estimate Shipping Schedule" ? '#007bff' : 'white',
            color: activeTab === "Estimate Shipping Schedule" ? '#fff' : '#000',
          }}
        >
          Shipping Schedule
        </button>
        <button
          className={`tab-button ${activeTab === "Part Costs" ? "active" : ""}`}
          onClick={() => handleTabChange("Part Costs")}
          style={{
            padding: '10px 20px',
            fontWeight: 'bold',
            backgroundColor: activeTab === "Part Costs" ? '#007bff' : 'white',
            color: activeTab === "Part Costs" ? '#fff' : '#000',
            borderTopRightRadius: '8px',
            borderTopLeftRadius: '8px',
            width: '300px',
          }}
        >
          Part Costs
        </button>
      </div>
      <div className="header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-15px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}></h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }} className="search-and-buttons-container">
          <div style={{ position: "relative", flex: "1", marginRight: "20px" }} className="search-input-container">
            <input
              type="text"
              placeholder="🔍 Search here"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                padding: "5px",
                borderRadius: "8px",
                border: "1px solid black",
                outline: "none",
                fontSize: "16px",
                transition: "all 0.3s",
                // boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                backgroundColor: "transparent",
                marginBottom: "10px",
              }}
            />
            {dropdownSuggestions.length > 0 && (
              <ul
                className="responsive-suggestions-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 1000,
                  marginTop: "-8px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  fontSize:"12px",
                  padding:"2px"
                }}
              >
                {dropdownSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSearchTerm(suggestion);
                      handleSearchChange(suggestion);
                      setDropdownSuggestions([]);
                    }}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      backgroundColor: index % 2 === 0 ? "#f8f8f8" : "#ffffff",
                      transition: "background-color 0.2s",
                    }}
                    // onMouseEnter={(e) =>
                    //   (e.target.style.backgroundColor = "#e0e0e0")
                    // }
                    // onMouseLeave={(e) =>
                    //   (e.target.style.backgroundColor =
                    //     index % 2 === 0 ? "#f8f8f8" : "#ffffff")
                    // }
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {activeTab === "Part Costs" && (
            
         <div className="responsive-buttons-container">
             
            <div className="datepicker-container" style={{ position: "relative", display: "inline-block" }}>
              <button
                hidden={access!==3}
                className="responsive-edit-button"
                onClick={togglePopup}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "orange",
                  color: "white",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginBottom: "10px",
                  marginRight: "10px",
                }}
              >
                <span style={{ marginRight: "5px", fontSize:"15px"  }}>Edit</span> <FontAwesomeIcon style={{fontSize:"5px", fontSize:"1px" }} icon={faPencil}></FontAwesomeIcon>
              </button>
            
              {/* Popup */}
              {showPopup && (
              <div
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "#FFF",
                  padding: "20px",
                  borderRadius: "10px",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                  width: "500px",
                  zIndex: 1000,
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  Edit Part Costs
                </h2>
              
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontWeight: "bold" }}>
                    Shipping Part:
                  </label>
                  <Popover open={open} onOpenChange={(value) => setOpen(value)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {selectedPart || "Select Shipping Part"}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 popover">
                      <Command>
                        <CommandInput placeholder="Search shipping part..." />
                        <CommandList>
                          <CommandEmpty>No parts found.</CommandEmpty>
                          <CommandGroup>
                            {partOptions.map((option) => (
                              <CommandItem
                                key={option}
                                onSelect={() => {
                                  console.log("Selected Option:", option);
                                  fetchPartData(option);
                                  setOpen(false); 
                                }}
                                style={{
                                  fontFamily: "Poppins, sans-serif",
                                  fontSize: "14px",
                                }}
                              >
                                {option}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    selectedPart === option ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                        
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  {["project"].map((field) => (
                    <div style={{ flex: 1 }} key={field}>
                      <label
                        style={{
                          display: "block",
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {field.replace("_", " ")}:
                      </label>
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        readOnly={field === "project"}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: field === "project" ? "1px solid #CCC" : "1px solid #999",
                          backgroundColor: field === "project" ? "#f9f9f9" : "white",
                        }}
                      />
                    </div>
                  ))}
                </div>
              
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  {/* Currency (currUnit) */}
                    <div style={{ flex: 3 }}>
                      <label style={{ display: "block", fontWeight: "bold" }}>Currency:</label>
                      <select
                        value={formData.currUnit || ""} 
                        onChange={(e) => handleInputChange("currUnit", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #CCC",
                          backgroundColor: "#FFF", 
                        }}
                      >
                        <option value="" disabled>Select Currency</option>
                        <option value="USD">USD</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                  {/* Rate USD */}
                  <div style={{ flex: 3 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Unit Price:</label>
                    <input
                      type="number"
                      readOnly={formData.currUnit === "INR"}
                      value={formData.rateUSD || 0.00}
                      onChange={(e) => handleInputChange("rateUSD", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                      }}
                    />
                  </div>
                  {/* Forex */}
                  <div style={{ flex: 3 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Forex:</label>
                    <input
                      type="number"
                      readOnly={formData.currUnit === "INR"}
                      value={formData.forex || 0.00}
                      onChange={(e) => handleInputChange("forex", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                      }}
                    />
                  </div>
                </div>
                    
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    
                  {/* Rate INR */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Final Price INR:</label>
                    <input
                      type="number"
                      value={formData.rateINR || 0.00}
                      onChange={(e) => handleInputChange("rateINR", e.target.value)}
                      readOnly={formData.currUnit === "USD"}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                        backgroundColor: "#f9f9f9", 
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                  <Button
                    onClick={handleEdit}
                    style={{
                      backgroundColor: "orange",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      fontWeight: "bold",
                      width:"49%"
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={togglePopup}
                    style={{
                      backgroundColor: "#DC3545",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      fontWeight: "bold",
                      width:"49%"
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            </div>
            <div className="datepicker-container" style={{ position: "relative", display: "inline-block" }}>
              {/* Insert Button */}
              <button
                hidden={access!==3}
                className="responsive-insert-button"
                onClick={togglePopupInsert} 
                style={{
                  padding: "6px 12px",
                  backgroundColor: "green",
                  color: "white",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginBottom: "10px",
                  marginRight: "10px",
                }}
              >
            <span style={{ marginRight: "5px", fontSize:"15px"  }}>Insert</span> <b>+</b>
              </button>
            
              {/* Insert Popup */}
              {showInsertPopup && (
                <div
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "#FFF",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                    width: "500px",
                    zIndex: 1000,
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: "20px",
                    }}
                  >
                    Insert Part Costs
                  </h2>
                
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>
                      Shipping Part:
                    </label>
                      <Popover
                        open={open}
                        onOpenChange={async (value) => {
                          setOpen(value);
                          if (value) {
                            await fetchPartOptionsForInsert();
                          }
                        }}
                      >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedPart || "Select Shipping Part"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 popover">
                        <Command>
                          <CommandInput placeholder="Search shipping part..." />
                          <CommandList>
                            <CommandEmpty>No parts found.</CommandEmpty>
                            <CommandGroup>
                              {partOptionsForInsert.map((option) => (
                                <CommandItem
                                  key={option}
                                  onSelect={() => {
                                    console.log("Selected Option:", option);
                                    fetchPartData(option);
                                    setSelectedPart(option);
                                    setOpen(false); 
                                  }}
                                  style={{
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "14px",
                                  }}
                                >
                                  {option}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      selectedPart === option ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
              
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  {/* Currency (currUnit) */}
                  <div style={{ flex: 3 }}>
                      <label style={{ display: "block", fontWeight: "bold" }}>Currency:</label>
                      <select
                        value={formData.currUnit || ""} 
                        onChange={(e) => handleInputChange("currUnit", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #CCC",
                          backgroundColor: "#FFF", 
                        }}
                      >
                        <option value="" disabled>Select Currency</option>
                        <option value="USD">USD</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    
                  {/* Rate USD */}
                  <div style={{ flex: 3 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Unit Price:</label>
                    <input
                      type="number"
                      value={formData.rateUSD || 0.00}
                      readOnly={formData.currUnit === "INR"}
                      onChange={(e) => handleInputChange("rateUSD", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                      }}
                    />
                  </div>
                  {/* Forex */}
                  <div style={{ flex: 3 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Forex:</label>
                    <input
                      type="number"
                      readOnly={formData.currUnit === "INR"}
                      value={formData.forex || 0.00}
                      onChange={(e) => handleInputChange("forex", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                      }}
                    />
                  </div>
                </div>
                    
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    
                  {/* Rate INR */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Final Price INR:</label>
                    <input
                      type="number"
                      value={formData.rateINR || 0.00}
                      readOnly={formData.currUnit === "USD"}
                      onChange={(e) => handleInputChange("rateINR", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                        backgroundColor: "#f9f9f9", 
                      }}
                    />
                  </div>
                </div>
                
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                    <Button
                      onClick={handleInsert}
                      style={{
                        backgroundColor: "green",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        width: "49%",
                      }}
                    >
                      Insert
                    </Button>
                    <Button
                      onClick={togglePopupInsert}
                      style={{
                        backgroundColor: "#DC3545",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        width: "49%",
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="datepicker-container" style={{ position: "relative", display: "inline-block" }}>
              {/* Delete Button */}
              <button
                hidden={access!==3}
                className="responsive-delete-button"
                onClick={togglePopupDelete} 
                style={{
                  padding: "6px 12px",
                  backgroundColor: "red",
                  color: "white",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginBottom: "10px",
                  marginRight: "10px",
                }}
              >
                <span style={{ marginRight: "5px", fontSize:"15px" }}>Remove</span> <FontAwesomeIcon style={{fontSize:"10px" }} icon={faTrash}></FontAwesomeIcon>
              </button>
            
              {/* Delete Popup */}
              {showDeletePopup && (
                <div
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "#FFF",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                    width: "500px",
                    zIndex: 1000,
                  }}
                >
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      textAlign: "center",
                      marginBottom: "20px",
                    }}
                  >
                    Remove Part Costs
                  </h2>
                
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>
                      Shipping Part:
                    </label>
                    <Popover open={open} onOpenChange={(value) => setOpen(value)}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedPart || "Select Shipping Part"}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 popover">
                        <Command>
                          <CommandInput placeholder="Search shipping part..." />
                          <CommandList>
                            <CommandEmpty>No parts found.</CommandEmpty>
                            <CommandGroup>
                              {partOptions.map((option) => (
                                <CommandItem
                                  key={option}
                                  onSelect={() => {
                                    console.log("Selected Option:", option);
                                    fetchPartData(option);
                                    setSelectedPart(option);
                                    setOpen(false); 
                                  }}
                                  style={{
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "14px",
                                  }}
                                >
                                  {option}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      selectedPart === option ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                          
                  <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  {["project"].map((field) => (
                    <div style={{ flex: 1 }} key={field}>
                      <label
                        style={{
                          display: "block",
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {field.replace("_", " ")}:
                      </label>
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        readOnly={field === "project"}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px",
                          border: field === "project" ? "1px solid #CCC" : "1px solid #999",
                          backgroundColor: field === "project" ? "#f9f9f9" : "white",
                        }}
                      />
                    </div>
                  ))}
                </div>
              
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  {/* Currency (currUnit) */}
                  <div style={{ flex: 3 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Currency:</label>
                    <input
                      type="text"
                      value={formData.currUnit || ""}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                        backgroundColor: "#f9f9f9",
                      }}
                    />
                  </div>
                  {/* Rate USD */}
                  <div style={{ flex: 3 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Unit Price:</label>
                    <input
                      type="number"
                      readOnly
                      value={formData.rateUSD || 0.00}
                      onChange={(e) => handleInputChange("rateUSD", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                      }}
                    />
                  </div>
                  {/* Forex */}
                  <div style={{ flex: 3 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Forex:</label>
                    <input
                      readOnly
                      type="number"
                      value={formData.forex || 0.00}
                      onChange={(e) => handleInputChange("forex", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                      }}
                    />
                  </div>
                </div>
                    
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    
                  {/* Rate INR */}
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontWeight: "bold" }}>Final Price INR:</label>
                    <input
                      type="number"
                      value={formData.rateINR || 0.00}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #CCC",
                        backgroundColor: "#f9f9f9", 
                      }}
                    />
                  </div>
                </div>
                
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                    <Button
                      onClick={handleDelete}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        width: "49%",
                      }}
                    >
                      Remove
                    </Button>
                    <Button
                      onClick={togglePopupDelete}
                      style={{
                        backgroundColor: "#DC3545",
                        color: "white",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        width: "49%",
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
         </div>
        
        )}
      </div>
      
      </div>
      <div className="content-container" style={{ padding: '10px', background: '#fff', borderRadius: '8px', borderTopLeftRadius: '0px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginTop: '-1px', maxHeight: '100vh', overflowX: 'hidden', overflowY: 'hidden' }}>
        <div className="table-container" style={{ overflowY: 'auto', maxHeight: '70vh', borderRadius: '8px', borderTopLeftRadius: '8px' }}>
          {activeTab === "Part Costs" && (
              <div>
                <table className="min-w-full table-auto border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead className="sticky top-0 bg-gray-300">
                    <tr>
                      <th hidden style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }} className="border px-4 py-2">Part ID</th>
                      <th style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }} className="border px-4 py-2">Project</th>
                      <th style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }} className="border px-4 py-2">Ship p/n</th>
                      <th style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }} className="border px-4 py-2">Currency</th>
                      <th style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }} className="border px-4 py-2">Unit Price</th>
                      <th style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }} className="border px-4 py-2">Forex</th>
                      <th style={{ backgroundColor: 'grey', color: 'white', textAlign: 'center', border: '1px solid white', padding: '8px' }} className="border px-4 py-2">Final Price (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableData.length > 0 ? (
                      filteredTableData.map((row, index) => {
                        return(
                          <tr key={row.part_ID} style={{
                        ...getRowBackgroundColorTab4(index),
                        fontFamily: 'calibri',
                        fontSize: '13px', 
                        padding: '4px',
                      }}>
                          <td hidden style={{ padding: '5px' }} className="border px-4 py-2">{row.part_ID}</td>
                          <td style={{ textAlign: 'left', padding: '5px' }} className="border px-4 py-2">{row.project}</td>
                          <td style={{ textAlign: 'center', padding: '5px' }} className="border px-4 py-2">{row.shipping_pn}</td>
                          <td style={{ textAlign: 'center', padding: '5px' }} className="border px-4 py-2">{row.curr_unit}</td>
                          <td style={{ textAlign: 'right', padding: '5px' }} className="border px-4 py-2">{row.rate_USD}</td>
                          <td style={{ textAlign: 'right', padding: '5px' }} className="border px-4 py-2">{row.forex}</td>
                          <td style={{ textAlign: 'right', padding: '5px' }} className="border px-4 py-2">{row.rate_INR}</td>
                        </tr>
                        )}
                      )
                    ) : (
                      <tr>
                        <td colSpan="6" className="border px-4 py-2 text-center">No Data Available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

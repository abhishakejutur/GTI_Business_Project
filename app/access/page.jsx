"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function Permissions() {
  const [employeeIds, setEmployeeIds] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [tableData, setTableData] = useState([]);
  const [accessOptions, setAccessOptions] = useState({});
  const [pages, setPages] = useState([]);
  const [open, setOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [insertPopupOpen, setInsertPopupOpen] = useState(false);
  const [accessData, setAccessData] = useState([]);
  const [access, setAccess] = useState();
  const [newAccess, setNewAccess] = useState({ empId: "", pageId: "", access: 0, pageName: "" });

  useEffect(() => {
    const empid = localStorage.getItem("employeeId");
    fetchEmployeeAccess(empid);
  }, []);
  useEffect(() => {
    if (accessData.length > 0) {
      const accessLevel = getAccessForPage("AccessManagement");
      setAccess(accessLevel);
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
  const fetchEmployeeIds = async () => {
    try {
      const response = await fetch("http://10.40.20.93:300/Product/empIds");
      const data = await response.json();
      const processedData = data.map((item) => {
        const [id, name] = item.split(",");
        return { id, name };
      });
  
      setEmployeeIds(processedData);
    } catch (error) {
      console.error("Error fetching employee IDs:", error);
    }
  };

  const fetchAccessData = async (empId) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/getAccess?empId=${empId}`);
      const data = await response.json();
      setTableData(data);
    } catch (error) {
      console.error("Error fetching access data:", error);
    }
  };

  const fetchAccessOptions = async () => {
    try {
      const response = await fetch("http://10.40.20.93:300/Access/Allpages");
      const data = await response.json();
      const options = data.reduce((acc, page) => {
        acc[page.id] = ["No Access", ...page.access_types.split(", ")];
        return acc;
      }, {});
      setAccessOptions(options);
      setPages(data);
    } catch (error) {
      console.error("Error fetching access options:", error);
    }
  };

  const updateAccess = async (empId, pageId, access) => {
    const payload = { empId, page_id: pageId, access };
    try {
      await fetch("http://10.40.20.93:300/Access/giveAccess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating access:", error);
    }
  };

  const insertAccess = async () => {
    try {
      const payload = { empId: newAccess.empId, page_id: newAccess.pageId, access: newAccess.access };
      const response = await fetch("http://10.40.20.93:300/Access/giveAccess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (result.message.includes("success")) {
        fetchAccessData(newAccess.empId);
        setInsertPopupOpen(false);
      }
    } catch (error) {
      console.error("Error inserting access:", error);
    }
  };

  const handlePageIdChange = (pageId) => {
    const page = pages.find((p) => p.id === parseInt(pageId));
    setNewAccess((prev) => ({
      ...prev,
      pageId,
      pageName: page?.page || "",
    }));
  };

  const handleAccessChange = (empId, pageId, access) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.page_id === pageId
          ? {
              ...row,
              access: access,
            }
          : row
      )
    );
    updateAccess(empId, pageId, access);
  };

  useEffect(() => {
    fetchEmployeeIds();
    fetchAccessOptions();
  }, []);

  return (
    <div className="container" style={{ maxWidth: "100%", padding: "20px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="tab-container" style={{ display: "flex", borderBottom: "1px solid #ddd", marginBottom: "-20px" }}>
          <button
            className={`tab-button active`}
            style={{
              padding: "10px 20px",
              fontWeight: "bold",
              backgroundColor: "#007bff",
              color: "#fff",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              cursor: "default",
              width: "300px",
            }}
          >
            Access Management
          </button>
        </div>
        <div className="header-section" style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "-15px", marginRight: "10px" }}>
          <Popover open={open} onOpenChange={(value) => setOpen(value)}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
                style={{
                  minWidth: "200px",
                  textAlign: "left",
                  padding: "10px",
                  fontWeight: "bold",
                  backgroundColor: "transparent",
                  border: "1px solid black",
                }}
              >
                {selectedEmpId || "Select Employee ID"}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 popover">
              <Command>
                <CommandInput placeholder="Search employee ID..." />
                <CommandList>
                  <CommandEmpty>No employees found.</CommandEmpty>
                  <CommandGroup>
                    {employeeIds.map((employee) => (
                      <CommandItem
                        key={employee.id}
                        onSelect={() => {
                          setSelectedEmpId(employee.id);
                          fetchAccessData(employee.id);
                          setOpen(false);
                        }}
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                        }}
                      >
                        {employee.id} - {employee.name}
                        <Check
                          className={cn("ml-auto", selectedEmpId === employee.id ? "opacity-100" : "opacity-0")}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          { access === 3 && (
              <Button
                style={{
                  backgroundColor: "green",
                  color: "white",
                  fontWeight: "bold",
                  padding: "8px 16px",
                  borderRadius: "5px",
                }}
                onClick={() => setInsertPopupOpen(true)}
              >
                New Page Access +
              </Button>
            )}
        </div>
      </div>
      <div className="content-container" style={{ marginTop: "20px", background: "#fff", borderRadius: "8px", borderTopLeftRadius: "0px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", padding: "10px" }}>
        <div className="table-container" style={{ overflowY: "auto", maxHeight: "70vh", borderRadius: "8px", borderTopLeftRadius: "8px" }}>
          <table className="min-w-full table-auto" style={{ overflowY: "auto", maxHeight: "70vh", borderRadius: "8px", borderTopLeftRadius: "8px" }}>
            <thead className="sticky top-0 bg-gray-300">
              <tr style={{ borderRadius: "8px" }}>
                <th style={{ textAlign: "center", padding: "10px", backgroundColor: "grey", color: "white" }}>
                  Employee ID
                </th>
                <th style={{ textAlign: "center", padding: "10px", backgroundColor: "grey", color: "white" }}>
                  Page ID
                </th>
                <th style={{ textAlign: "center", padding: "10px", backgroundColor: "grey", color: "white" }}>
                  Page Name
                </th>
                <th style={{ textAlign: "center", padding: "10px", backgroundColor: "grey", color: "white" }}>
                  Access
                </th>
              </tr>
            </thead>
            <tbody style={{ padding: "8px" }}>
              {tableData.length > 0 ? (
                tableData.map((row, index) => (
                  <tr
                    key={row.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                      textAlign: "center",
                      fontSize: '13px',
                      padding: "2px",
                    }}
                  >
                    <td style={{ padding: "2px" }}>{row.empId}</td>
                    <td style={{ padding: "2px" }}>{row.page_id}</td>
                    <td style={{ padding: "2px" }}>{row.page}</td>
                    <td style={{ padding: "2px" }}>
                    {access === 3 ? (
                      <select
                        value={row.access || 0}
                        onChange={(e) => handleAccessChange(row.empId, row.page_id, parseInt(e.target.value))}
                        style={{
                          padding: "5px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "100%",
                          textAlign: "center",
                          cursor: "pointer",
                        }}
                      >
                        {accessOptions[row.page_id]?.map((option, idx) => (
                          <option key={idx} value={idx}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ display: "block", textAlign: "center", padding: "5px" }}>
                        {accessOptions[row.page_id]?.[row.access] || "No Access"}
                      </span>
                    )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: "10px", textAlign: "center" }}>
                    No Access Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {insertPopupOpen && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            padding: "20px",
            zIndex: 1000,
            width: "400px",
          }}
        >
          <h2 style={{ fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>New Page Access</h2>
          <div style={{ marginBottom: "15px" }}>
          <Popover open={popupOpen} onOpenChange={(value) => setPopupOpen(value)}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  style={{
                    minWidth: "200px",
                    textAlign: "left",
                    padding: "10px",
                    fontWeight: "bold",
                    backgroundColor: "transparent",
                    border: "1px solid black"
                  }}
                >
                  {newAccess.empId || "Select Employee ID"}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 popover" style={{ zIndex: 1001 }}>
                <Command>
                  <CommandInput placeholder="Search employee ID..." />
                  <CommandList>
                    <CommandEmpty>No employees found.</CommandEmpty>
                    <CommandGroup>
                      {employeeIds.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          onSelect={() => {
                            setNewAccess((prev) => ({ ...prev, empId: employee.id }));
                            setSelectedEmpId(employee.id);
                            fetchAccessData(employee.id); 
                            setPopupOpen(false);
                          }}
                          style={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                          }}
                        >
                          {employee.id} - {employee.name}
                          <Check
                            className={cn("ml-auto", newAccess.empId === employee.id ? "opacity-100" : "opacity-0")}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Page ID</label>
            <input
              type="number"
              value={newAccess.pageId}
              onChange={(e) => handlePageIdChange(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Page Name</label>
            <input
              type="text"
              value={newAccess.pageName}
              readOnly
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                backgroundColor: "#f9f9f9",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Access</label>
            <select
              value={newAccess.access}
              onChange={(e) => setNewAccess((prev) => ({ ...prev, access: parseInt(e.target.value) }))}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              {accessOptions[newAccess.pageId]?.map((option, idx) => (
                <option key={idx} value={idx}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={insertAccess}
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "8px 16px",
                borderRadius: "5px",
                fontWeight: "bold",
                width: "48%",
              }}
            >
              Give Access
            </Button>
            <Button
              onClick={() => setInsertPopupOpen(false)}
              style={{
                backgroundColor: "red",
                color: "white",
                padding: "8px 16px",
                borderRadius: "5px",
                fontWeight: "bold",
                width: "48%",
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

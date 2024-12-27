"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import './page.css';
import  secureLocalStorage  from  "react-secure-storage";
import { handleLogin } from "@/lib/auth";
// import { access } from "fs";

const getMonths = (startMonth, startYear) => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    const month = new Date(startYear, startMonth + i - 1, 1);
    months.push({
      value: month.toISOString(),
      label: `${month.toLocaleString("default", { month: "short" })}'${month
        .getFullYear()
        .toString()
        .slice(-2)}`,
    });
  }
  return months;
};

export default function NMC() {
  const [activeTab, setActiveTab] = React.useState("Casting Supplied by NWS");
  const [castPartNos, setCastPartNos] = React.useState([]);
  const [selectedCastPartNo, setSelectedCastPartNo] = React.useState("");
  const [selectedMonths, setSelectedMonths] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  const [openCastPartNos, setOpenCastPartNos] = React.useState(false);
  const [openMonth, setOpenMonth] = React.useState(false);
  const [months, setMonths] = React.useState([]);
  const [accessData, setAccessData] = React.useState([]);
  const [access, setAccess] = React.useState();
  const [userEdit, setUserEdit] = React.useState(false);
  const [expandedPartNo, setExpandedPartNo] = React.useState(null);
  const [subTableInputs, setSubTableInputs] = React.useState({});
  const [month, setMonth] = React.useState();
  const [year, setYear] = React.useState();

  const handleExpandRow = async (partNo) => {
    if (expandedPartNo === partNo) {
      setExpandedPartNo(null); 
      setSubTableInputs({});
      return;
    }
  
    try {
      const response = await fetch(
        `http://10.40.20.93:300/api/getNWSData?partNo=${partNo}&monthNo=${month}&yearNo=${year}`
      );
  
      if (response.ok) {
        const result = await response.json();
        console.log(result);
        console.log("month", month, "year", year);
        console.log("All Months list : ",months);
  
        if (result && Array.isArray(result.data) && result.data.length > 0) {
          const fetchedData = result.data[0]; 
  
          const formattedData = {
            month_1: fetchedData.a,
            month_2: fetchedData.b,
            month_3: fetchedData.c,
            month_4: fetchedData.d,
            month_5: fetchedData.e,
            month_6: fetchedData.f,
            month_7: fetchedData.g,
            month_8: fetchedData.h,
            month_9: fetchedData.i,
            month_10: fetchedData.j,
            month_11: fetchedData.k,
            month_12: fetchedData.l,
          };
  
          setSubTableInputs(formattedData);
        } else {
          console.error("Invalid or missing data in the response:", result);
          setSubTableInputs({});
        }
      } else {
        console.error("Failed to fetch subtable data:", await response.text());
        setSubTableInputs({});
      }
    } catch (error) {
      console.error("Error fetching subtable data:", error);
      setSubTableInputs({});
    }
  
    setExpandedPartNo(partNo);
  };
  
  const handleSubTableSave = async (partNo, excludedMonths) => {
    const createdBy = secureLocalStorage.getItem("nu");
    const excludedMonthArray = (excludedMonths || "").split(",").map((m) => m.trim());
  
    const payload = {
      partNo: partNo || "",
      monthNo: Number(month) || 0,
      yearNo: Number(year) || 0,
      createdBy: createdBy || "",
      a: "0",
      b: "0",
      c: "0",
      d: "0",
      e: "0",
      f: "0",
      g: "0",
      h: "0",
      i: "0",
      j: "0",
      k: "0",
      l: "0",
    };
  
    excludedMonthArray.forEach((trimmedMonth) => {
      const monthIndex = months.findIndex((m) => {
        const [monthName, year] = trimmedMonth.split(" ");
        const formattedMonthName = monthName.substring(0, 3);
        const formattedMonth = `${formattedMonthName}'${year.slice(-2)}`;
        return m.label === formattedMonth;
      }) + 1;      
  
      if (monthIndex > 0) {
        const fieldKey = String.fromCharCode(96 + monthIndex);
        payload[fieldKey] = subTableInputs[`month_${monthIndex}`] || "0";
      } else {
        console.error(`Excluded month "${trimmedMonth}" not found in months.`);
      }
    });
  
    try {
      const response = await fetch("http://10.40.20.93:300/api/saveNWS", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error saving subtable:", errorText);
        return;
      }
    
      const result = await response.json();
      console.log("Subtable saved successfully:", result);
    
      // Reset states after save
      setSubTableInputs({});
      setExpandedPartNo(null); 
    
      // Optionally refresh table data
      await fetchTableDataNWS();
    } catch (error) {
      console.error("Error saving subtable:", error);
    }
    
  };
  
  
  const handleSubTableInputChange = (month, value) => {
    setSubTableInputs((prev) => ({ ...prev, [month]: value }));
  };

  React.useEffect(() => {
    const checkLogin = async () => {
      const employeeId = secureLocalStorage.getItem("nu");
      const id = secureLocalStorage.getItem("die");
      const password = secureLocalStorage.getItem("ep");
  
      if (!employeeId || !password || !id) {
        console.log("No credentials found, redirecting to login.");
        secureLocalStorage.clear();
        secureLocalStorage.clear();
        window.location.href = "/";
        return;
      }
      const isAccess = await handleLogin(id, password);
      if (!isAccess) {
        console.log("Access failed, redirecting to login.");
        secureLocalStorage.clear();
        secureLocalStorage.clear();
        window.location.href = "/";
      } else {
        console.log("accessing Excluding page...");
      }
    };
    checkLogin();
    const employeeId = secureLocalStorage.getItem("nu");
    const empid = secureLocalStorage.getItem("die");
    fetchEmployeeAccess(empid);
    if (!employeeId) {
      window.location.href = "/";
      return;
    }
    fetchPartNos();
    fetchCurrentMonthAndYear();
    if (activeTab === "Casting Supplied by NWS") {
      fetchTableDataNWS();
    } else {
      fetchTableDataNPI();
    }
    resetSelections();
  }, [activeTab]);
  
  const fetchEmployeeAccess = async (employeeId) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/getAccess?empId=${employeeId}`);
      const data = await response.json();
      setAccessData(data);
  
      const accessLevel = data.find((item) => item.page === "Exclude")?.access || 0;
      setAccess(accessLevel);
      setUserEdit(accessLevel === 3);
  
      console.log("Exclude access number:", accessLevel);
      console.log("Exclude admin:", accessLevel === 3);
      console.log("Exclude User Edit:", userEdit);
  
      if (accessLevel === 0) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error fetching employee access:", error);
    }
  };
  
  
  const getAccessForPage = (pageName) => {
    const accessItem = accessData.find((item) => item.page === pageName);
    return accessItem ? accessItem.access : 0;
  };

  const fetchPartNos = async () => {
    try {
      const response = await fetch("http://10.40.20.93:300/Product/partnoview");
      const data = await response.json();
      setCastPartNos(data);
    } catch (error) {
      console.error("Error fetching Cast Part Nos:", error);
    }
  };

  const fetchTableDataNWS = async () => {
    try {
      const response = await fetch("http://10.40.20.93:300/api/getExclude");
      const data = await response.json();
      setTableData(data.data); 
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };
  
  const fetchTableDataNPI = async () => {
    try {
      const response = await fetch("http://10.40.20.93:300/api/getExcludeNPI");
      if (!response.ok) {
        console.error("Failed to fetch table data NPI:", response.statusText);
        return;
      }
      const data = await response.json();
      // console.log("Fetched NPI Table Data:", data); 
      setTableData(data.data || []); 
    } catch (error) {
      console.error("Error fetching table data NPI:", error);
    }
  };
  
  
  const fetchCurrentMonthAndYear = async () => {
    try {
      const response = await fetch(
        "http://10.40.20.93:300/customerForecast/getLatestMonthAndYear"
      );
      const data = await response.json();
      const { month_No, year_No } = data;
      let fmonth = month_No;
      let fyear = year_No;
      if(fmonth == 12){
        fmonth = 1;
        fyear = fyear + 1;
      } else {
        fmonth = fmonth + 1;
      }
      console.log("Check default fetching months list : ", fmonth, fyear, month_No, year_No);
      setMonths(getMonths(fmonth, fyear));
      setMonth(fmonth);
      setYear(fyear);
      // setMonths(getMonths(month_No, year_No));
    } catch (error) {
      console.error("Error fetching current month and year:", error);
    }
  };

  const toggleMonthSelection = (monthValue) => {
    setSelectedMonths((prev) =>
      prev.includes(monthValue)
        ? prev.filter((m) => m !== monthValue)
        : [...prev, monthValue]
    );
  };

  const handleRemoveRow = async (partNo, excludedMonths) => {
    const createdBy = secureLocalStorage.getItem("nu");
    const payload = {
      partNo,
      excludedMonths,
      createdBy,
      value: 0,
    };

    try {
      const response = await fetch(
        activeTab === "Casting Supplied by NWS"
          ? "http://10.40.20.93:300/api/exclude-NWS"
          : "http://10.40.20.93:300/api/exclude-NPI",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        activeTab === "Casting Supplied by NWS" ? fetchTableDataNWS() : fetchTableDataNPI();
        fetchPartNos();
      } else {
        const errorData = await response.json();
        console.error("Error removing row:", errorData);
      }
    } catch (error) {
      console.error("Error removing row:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedCastPartNo || (activeTab === "Casting Supplied by NWS" && selectedMonths.length === 0)) {
      alert("Please select a part number and at least one month.");
      return;
    }
  
    const createdBy = secureLocalStorage.getItem("nu");
    const formattedMonths = selectedMonths
      .map((month) =>
        new Date(month).toLocaleString("default", { month: "short", year: "2-digit" })
      )
      .join(", ");
    const payload = {
      partNo: selectedCastPartNo,
      excludedMonths: formattedMonths,
      createdBy,
      value: 1,
    };
  
    try {
      const response = await fetch(
        activeTab === "Casting Supplied by NWS"
          ? "http://10.40.20.93:300/api/exclude-NWS"
          : "http://10.40.20.93:300/api/exclude-NPI",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
  
      if (response.ok) {
        console.log("Save successful. Fetching updated table data...");
        if (activeTab === "Casting Supplied by NWS") {
          await fetchTableDataNWS();
        } else {
          await fetchTableDataNPI(); 
        }
        fetchPartNos(); 
        resetSelections(); 
      } else {
        activeTab === "Casting Supplied by NWS" ? fetchTableDataNWS() : fetchTableDataNPI();
        const errorData = await response.json();
        console.error("Error saving row:", errorData);
      }
    } catch (error) {
      console.error("Error saving row:", error);
    }
  };
  
  
  const resetSelections = () => {
    setSelectedCastPartNo("");
    setSelectedMonths([]);
  };

  

  return (
    <div className="container" style={{ maxWidth: '100%', padding: '10px', overflow: "hidden" }}>
      <div className="tab-container" style={{ display: 'flex', borderBottom: '0px solid #ddd', marginBottom: '2px', }}>
        <button
          className={`tab-button ${activeTab === "Casting Supplied by NWS" ? "active" : ""}`}
          onClick={() => setActiveTab("Casting Supplied by NWS")}
          style={{
            padding: '10px 15px',
            fontWeight: activeTab === "Casting Supplied by NWS" ? 'bold' : 'normal',
            backgroundColor: activeTab === "Casting Supplied by NWS" ? '#007bff' : 'white',
            color: activeTab === "Casting Supplied by NWS" ? '#fff' : '#000',
            borderTopLeftRadius: '8px',
            fontSize: '13px',
          }}
        >
          Casting Supplied by NWS
        </button>
        <button
          className={`tab-button ${activeTab === "New Projects" ? "active" : ""}`}
          onClick={() => setActiveTab("New Projects")}
          style={{
            padding: '10px 15px',
            fontWeight: activeTab === "New Projects" ? 'bold' : 'normal',
            backgroundColor: activeTab === "New Projects" ? '#007bff' : 'white',
            color: activeTab === "New Projects" ? '#fff' : '#000',
            borderTopRightRadius: '8px',
            fontSize: '13px',
          }}
        >
          New Projects
        </button>
      </div>

      <div className="content-container" style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        borderTopLeftRadius: '0px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        marginTop: '-1px'
      }}>
        <ScreenSection
          title={activeTab}
          openCastPartNos={openCastPartNos}
          setOpenCastPartNos={setOpenCastPartNos}
          castPartNos={castPartNos}
          selectedCastPartNo={selectedCastPartNo}
          setSelectedCastPartNo={setSelectedCastPartNo}
          openMonth={openMonth}
          setOpenMonth={setOpenMonth}
          months={months}
          toggleMonthSelection={toggleMonthSelection}
          selectedMonths={selectedMonths}
          handleSave={handleSave}
          tableData={tableData}
          handleRemoveRow={handleRemoveRow}
          isCastingNWS={activeTab === "Casting Supplied by NWS"}
          userEdit={userEdit}
          expandedPartNo={expandedPartNo}
          subTableInputs={subTableInputs}
          handleSubTableInputChange={handleSubTableInputChange}
          handleExpandRow={handleExpandRow} 
          handleSubTableSave={handleSubTableSave}
        />
      </div>
    </div>
  );
}

function ScreenSection({
  title,
  openCastPartNos,
  setOpenCastPartNos,
  castPartNos,
  selectedCastPartNo,
  setSelectedCastPartNo,
  openMonth,
  setOpenMonth,
  months,
  toggleMonthSelection,
  selectedMonths,
  handleSave,
  tableData,
  handleRemoveRow,
  isCastingNWS,
  userEdit,
  expandedPartNo,
  handleExpandRow,
  subTableInputs,
  handleSubTableInputChange,
  handleSubTableSave,
}) {
  return (
    <div className="flex flex-col w-full space-y-4" style={{ margin: 'auto', fontSize: '12px' }}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
        <h2 className="font-bold text-sm" style={{ fontSize: '16px', textAlign: 'left' }}>{title}</h2>
        <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-2 lg:space-y-0">
          {userEdit && (
            <Popover open={openCastPartNos} onOpenChange={setOpenCastPartNos}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCastPartNos}
                className="w-full lg:w-[170px] justify-between border border-[black] bg-transparent"
                style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', width: '100%' }}
              >
                {selectedCastPartNo ? selectedCastPartNo : "Select ship Part Nos"}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full lg:w-[176px] p-0 border border-[black] bg-transparent">
              <Command>
                <CommandInput style={{fontSize:"12px", fontFamily: 'Poppins, sans-serif' }} placeholder="Search Part No..." className="h-7" />
                <CommandList>
                  <CommandEmpty style={{fontSize:"12px", fontFamily: 'Poppins, sans-serif' }}>Not Found</CommandEmpty>
                  <CommandGroup>
                    {castPartNos.map((partNo) => (
                      <CommandItem
                        key={partNo}
                        value={partNo}
                        onSelect={() => {
                          setSelectedCastPartNo(partNo);
                          setOpenCastPartNos(false);
                        }}
                        style={{fontSize:"12px", fontFamily: 'Poppins, sans-serif' }}
                      >
                        {partNo}
                        <CheckIcon
                          className={selectedCastPartNo === partNo ? "opacity-100" : "opacity-0"}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          )}

          {isCastingNWS && userEdit && (
            <Popover open={openMonth} onOpenChange={setOpenMonth}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openMonth}
                  className="w-full lg:w-[190px] justify-between border border-[black] bg-transparent"
                  style={{ fontFamily: 'Poppins, sans-serif', fontSize: '12px', width: '100%' }}
                >
                  {selectedMonths.length > 0
                    ? `${selectedMonths.length} month(s) selected`
                    : "Select months..."}
                  <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full lg:w-[153px] p-0 border border-[black] bg-transparent">
                <Command>
                  <CommandInput style={{fontSize:"12px", fontFamily: 'Poppins, sans-serif' }} placeholder="Search month..." className="h-7" />
                  <CommandList>
                    <CommandEmpty>No month found.</CommandEmpty>
                    <CommandGroup>
                      {months.map((month) => (
                        <CommandItem
                          key={month.value}
                          value={month.value}
                          onSelect={() => toggleMonthSelection(month.value)}
                          style={{fontSize:"12px", fontFamily: 'Poppins, sans-serif' }}
                        >
                          {month.label}
                          <CheckIcon
                            className={selectedMonths.includes(month.value) ? "opacity-100" : "opacity-0"}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          {userEdit && (
            <Button
            onClick={handleSave}
            variant="solid"
            className="w-full lg:w-auto mt-2 lg:mt-0"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '10px',
              padding: "8px 16px",
              backgroundColor: "green",
              color: "white",
              cursor: "pointer",
              transition: "background-color 0.3s",
              width: "100%",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "darkgreen")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "green")}
          >
            Save
          </Button>
          )}
        </div>
      </div>
      <div className="overflow-auto border border-gray-300 rounded-md" style={{ maxHeight: '300px', fontSize: '14px', overflowX: 'auto' }}>
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="border px-1 py-1">Part No</th>
              {isCastingNWS && <th className="border px-1 py-1">Excluded Months</th>}
              <th className="border px-1 py-1">Created By</th>
              <th className="border px-1 py-1">Created On</th>
              {userEdit && <th className="border px-1 py-1">Remove</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50">
                    {isCastingNWS ? (
                      <td className="border px-1 py-1">
                      {userEdit ?(
                        <button
                        style={{ color: "green", textDecoration: "underline" }}
                        onClick={() => handleExpandRow(row.partNo)}
                      >
                        {row.partNo}
                      </button>
                      ) : (
                        <span>{row.partNo}</span>
                      )}
                      </td>
                    ) : (
                      <td className="border px-1 py-1">{row.partNo}</td>
                    )}
                    {isCastingNWS && (
                      <td className="border px-1 py-1">{row.excludedMonths || "N/A"}</td>
                    )}
                    <td className="border px-1 py-1">{row.createdBy || "N/A"}</td>
                    <td className="border px-1 py-1">
                      {row.createdOn ? new Date(row.createdOn).toLocaleDateString() : "N/A"}
                    </td>
                    {userEdit && (
                      <td className="border px-1 py-1" style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>
                        <button onClick={() => handleRemoveRow(row.partNo, row.excludedMonths)}>X</button>
                      </td>
                    )}
                  </tr>
                  {/* Subtable */}
                  {expandedPartNo === row.partNo && isCastingNWS && (
                  <tr>
                    <td colSpan={isCastingNWS ? "5" : "4"} className="bg-gray-100">
                      <div
                        style={{
                          padding: "10px",
                          margin: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div className="flex flex-wrap gap-2">
                          {row.excludedMonths
                            .split(",")
                            .map((month, idx) => {
                              const trimmedMonth = month.trim();
                            
                              const monthIndex = months.findIndex((m) => {
                                const [monthName, year] = trimmedMonth.split(" ");
                                const formattedMonthName = monthName.substring(0, 3); 
                                const formattedMonth = `${formattedMonthName}'${year.slice(-2)}`;
                                return m.label === formattedMonth;
                              }) + 1;
                              
                            
                              if (monthIndex === 0) {
                                console.error(`Excluded month "${trimmedMonth}" not found in months.`);
                                return null;
                              }
                            
                              return (
                                <div key={monthIndex} className="flex flex-col gap-1">
                                  <label
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                      paddingLeft: "5px",
                                    }}
                                  >
                                    {trimmedMonth} 
                                  </label>
                                  <input
                                    type="number"
                                    value={subTableInputs[`month_${monthIndex}`] || ""}
                                    onChange={(e) =>
                                      handleSubTableInputChange(
                                        `month_${monthIndex}`,
                                        e.target.value
                                      )
                                    }
                                    className="border px-2 py-1 rounded-md text-sm"
                                    style={{ width: "80px" }}
                                  />
                                </div>
                              );
                            })}
                        </div>
                        <div>
                          <button
                            onClick={() => handleSubTableSave(row.partNo, row.excludedMonths)}
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={isCastingNWS ? "5" : "4"} className="border px-1 py-1 text-center">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

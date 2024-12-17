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

  React.useEffect(() => {
    const checkLogin = async () => {
      const employeeId = secureLocalStorage.getItem("nu");
      const id = secureLocalStorage.getItem("die");
      const password = secureLocalStorage.getItem("ep");
  
      if (!employeeId || !password) {
        console.log("No credentials found, redirecting to login.");
        secureLocalStorage.clear();
        secureLocalStorage.clear();
        window.location.href = "/";
        return;
      }
      const isAccess = await handleLogin(id, password);
      if (!isAccess) {
        console.log("Login failed, redirecting to login.");
        secureLocalStorage.clear();
        secureLocalStorage.clear();
        window.location.href = "/";
      } else {
        console.log("Login successful, accessing Dashboard.");
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
      console.log("Fetched NPI Table Data:", data); // Debug log
      setTableData(data.data || []); // Ensure the state is updated
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

      setMonths(getMonths(month_No, year_No));
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
    <div className="container" style={{ maxWidth: '100%', padding: '20px' }}>
      <div className="tab-container" style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '1px'}}>
        <button
          className={`tab-button ${activeTab === "Casting Supplied by NWS" ? "active" : ""}`}
          onClick={() => setActiveTab("Casting Supplied by NWS")}
          style={{
            padding: '10px 20px',
            fontWeight: activeTab === "Casting Supplied by NWS" ? 'bold' : 'normal',
            backgroundColor: activeTab === "Casting Supplied by NWS" ? '#007bff' : 'white',
            color: activeTab === "Casting Supplied by NWS" ? '#fff' : '#000',
            borderTopLeftRadius: '8px',
          }}
        >
          Casting Supplied by NWS
        </button>
        <button
          className={`tab-button ${activeTab === "New Projects" ? "active" : ""}`}
          onClick={() => setActiveTab("New Projects")}
          style={{
            padding: '10px 20px',
            fontWeight: activeTab === "New Projects" ? 'bold' : 'normal',
            backgroundColor: activeTab === "New Projects" ? '#007bff' : 'white',
            color: activeTab === "New Projects" ? '#fff' : '#000',
            borderTopRightRadius: '8px',
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
  userEdit
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
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-1 py-1">{row.partNo}</td>
                  {isCastingNWS && (
                    <td className="border px-1 py-1">{row.excludedMonths || "N/A"}</td>
                  )}
                  <td className="border px-1 py-1">{row.createdBy || "N/A"}</td>
                  <td className="border px-1 py-1">{row.createdOn ? new Date(row.createdOn).toLocaleDateString() : "N/A"}</td>
                  {userEdit && <td className="border px-1 py-1" style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>
                    <button onClick={() => handleRemoveRow(row.partNo, row.excludedMonths)}>X</button>
                  </td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isCastingNWS ? "5" : "4"} className="border px-1 py-1 text-center">No Data Available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

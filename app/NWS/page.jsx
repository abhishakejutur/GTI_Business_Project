"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
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

const getMonths = () => {
  const months = [];
  const current = new Date();
  current.setDate(current.getDate() + 20);
  for (let i = 0; i < 12; i++) {
    const month = new Date(current.getFullYear(), current.getMonth() + i, 1);
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
  const [openCastPartNos, setOpenCastPartNos] = React.useState(false);
  const [openMonth, setOpenMonth] = React.useState(false);
  const [castPartNos, setCastPartNos] = React.useState([]);
  const [selectedCastPartNo, setSelectedCastPartNo] = React.useState("");
  const [selectedMonths, setSelectedMonths] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true);

  const months = getMonths();
  React.useEffect(() => {
    const employeeId = localStorage.getItem("username");
    if (!employeeId) {
      window.location.href = "/";
      return;
    }
    fetch("http://10.40.20.93:300/Product/partnoview")
      .then((response) => response.json())
      .then((data) => setCastPartNos(data))
      .catch((error) => console.error("Error fetching Cast Part Nos:", error));

    fetchTableData();
  }, []);

  const fetchTableData = async () => {
    try {
      const response = await fetch("http://10.40.20.93:300/api/getExclude");
      const data = await response.json();
      setTableData(data.data);
    } catch (error) {
      console.error("Error fetching table data:", error);
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
    const createdBy = localStorage.getItem("username");
    const payload = {
      partNo,
      excludedMonths,
      createdBy,
      value: 0,
    };

    try {
      const response = await fetch("http://10.40.20.93:300/api/exclude-NWS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchTableData();
      } else {
        const errorData = await response.json();
        console.error("Error removing row:", errorData);
      }
    } catch (error) {
      console.error("Error removing row:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedCastPartNo || selectedMonths.length === 0) {
      alert("Please select a part number and at least one month.");
      return;
    }

    const createdBy = localStorage.getItem("username");
    const formattedMonths = selectedMonths
      .map((month) =>
        new Date(month).toLocaleString("default", {
          month: "short",
          year: "2-digit",
        })
      )
      .join(", ");
    const payload = {
      partNo: selectedCastPartNo,
      excludedMonths: formattedMonths,
      createdBy,
      value: 1,
    };

    try {
      const response = await fetch("http://10.40.20.93:300/api/exclude-NWS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchTableData();
      } else {
        const errorData = await response.json();
        console.error("Error saving row:", errorData);
      }
    } catch (error) {
      console.error("Error saving row:", error);
    }
  };

  return (
    <div className="flex flex-col space-y-4" style={{ fontFamily: 'Poppins, sans-serif', padding: '20px' }}>
      <div className="flex justify-between items-top mb-4" style={{ marginTop: "-20px", marginBottom: "50px" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "24px" }}>Casting Supplied by NWS</h2>
        <div className="flex flex-wrap justify-end items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Popover open={openCastPartNos} onOpenChange={setOpenCastPartNos}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCastPartNos}
                className="w-[200px] justify-between border border-[black] bg-transparent"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {selectedCastPartNo ? selectedCastPartNo : "Select Cast Part Nos"}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 border border-[black] bg-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <Command>
                <CommandInput placeholder="Search Cast Part No..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No Cast Part No found.</CommandEmpty>
                  <CommandGroup>
                    {castPartNos.map((partNo) => (
                      <CommandItem
                        key={partNo}
                        value={partNo}
                        onSelect={() => {
                          setSelectedCastPartNo(partNo);
                          setOpenCastPartNos(false);
                        }}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {partNo}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedCastPartNo === partNo ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover open={openMonth} onOpenChange={setOpenMonth}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openMonth}
                className="w-[200px] justify-between border border-[black] bg-transparent"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {selectedMonths.length > 0
                  ? `${selectedMonths.length} month(s) selected`
                  : "Select months..."}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 border border-[black] bg-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <Command>
                <CommandInput placeholder="Search month..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No month found.</CommandEmpty>
                  <CommandGroup>
                    {months.map((month) => (
                      <CommandItem
                        key={month.value}
                        value={month.value}
                        onSelect={() => {
                          toggleMonthSelection(month.value);
                        }}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {month.label}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedMonths.includes(month.value) ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleSave}
            variant="solid"
            style={{
              fontFamily: 'Poppins, sans-serif',
              padding: "10px 20px",
              backgroundColor: "green",
              color: "white",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "darkgreen")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "green")}
          >
            Save
          </Button>
        </div>
      </div>

      <div className="overflow-auto border border-gray-300 rounded-lg shadow-md" style={{ maxHeight: '400px' }}>
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-gray-200 sticky top-0">
          <tr>
            <th className="border px-4 py-2">Part No</th>
            <th className="border px-4 py-2">Excluded Months</th>
            <th className="border px-4 py-2">Created By</th>
            <th className="border px-4 py-2">Created On</th>
            <th className="border px-4 py-2">Remove</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {tableData.length > 0 ? (
            tableData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{row.partNo}</td>
                <td className="border px-4 py-2">{row.excludedMonths || "N/A"}</td>
                <td className="border px-4 py-2">{row.createdBy || "N/A"}</td>
                <td className="border px-4 py-2">{row.createdOn ? new Date(row.createdOn).toLocaleDateString() : "N/A"}</td>
                <td className="border px-4 py-2" style={{ color: "red", textAlign: "center", fontWeight: "bold" }}>
                  <button
                    onClick={() => handleRemoveRow(row.partNo, row.excludedMonths)}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="border px-4 py-2 text-center">No Data Available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  );
}

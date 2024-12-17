"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import './globals.css';
import { constants } from "buffer";
import  secureLocalStorage  from  "react-secure-storage";

export default function Home() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessData, setAccessData] = useState([]);
  const [dashboard, setDashboard] = useState("");

  useEffect(() => {
    const sidebar = document.querySelector("#sidebar"); 
    const nav = document.querySelector("#main-content > nav"); 
    const body = document.querySelector("body");
    const content = document.querySelector("#content main");
    if (sidebar) {
      sidebar.style.display = "none";
    }
    if (nav) {
      nav.style.display = "none";
    }
    body.style.overflowY = "hidden";
    content.style.overflowY="hidden";
    document.documentElement.style.overflowY = "hidden"; 

    return () => {
      if (sidebar) {
        sidebar.style.display = "";
      }
      if (nav) {
        nav.style.display = "";
      }
    };
  }, []);
  
  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
  
    if (!employeeId || !password) {
      setError("Both Employee ID and Password are required.");
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch("http://10.40.20.93:300/api/Login/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        secureLocalStorage.setItem("die", data.employeeId);
        secureLocalStorage.setItem("nu", data.username);
        secureLocalStorage.setItem("ep", password);
        const emp_id = secureLocalStorage.getItem("die");
        await fetchEmployeeAccess(emp_id);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Login failed. Please try again.");
        window.location.href = "/";
      }
    } catch (err) {
      setError("Incorrect Employee ID or Password.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchEmployeeAccess1 = async (employeeId) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/pageAccess?empId=${employeeId}`);
      // console.log("API Response:", response);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      // console.log("Parsed Data:", data);
  
      if (data[0]) {
        // console.log("Access data:", data);
  
        localStorage.setItem("dashboardAccess", data[0].dashboard_Access);
        localStorage.setItem("dashboardCostAccess", data[0].dashboard_Cost_Access);
  
        if (!data[0].dashboard_Access) {
          alert("Access denied!");
          window.location.href = "/";
          return;
        }
        window.location.href = "/dashboard";
      } else {
        alert("Access data not found. Please contact the administrator.");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error fetching employee access:", error);
      alert("An error occurred while checking access. Please try again later.");
      window.location.href = "/";
    }
  };

  const fetchEmployeeAccess = async (employeeId) => {
    try {
      const response = await fetch(`http://10.40.20.93:300/getAccess?empId=${employeeId}`);
      const data = await response.json();
      // console.log("Access data fetched:", data);
      setAccessData(data);
      const pages = data.map((item) => ({ page: item.page, access: item.access }));
      let nextPage = null;

      for (const page of pages) {
        if (page.access > 0) {
          nextPage = page.page;
          break;
        }
      }
      console.log("First page:", nextPage);
      switch (nextPage) {
        case "Dashboard":
          window.location.href = "/dashboard";
          break;
        case "ShippingSchedule":
          window.location.href = "/Shipping_plan";
          break;
        case "Forecast":
          window.location.href = "/Forecast";
          break;
        case "Exclude":
          window.location.href = "/exclude";
          break;
        case "PartCosts":
          window.location.href = "/partcosts";
          break;
        case "AccessManagement":
          window.location.href = "/access";
          break;
        default:
          alert("Access denied!");
          window.location.href = "/";
          break;
      }
      // if (data.some((item) => item.page === "Dashboard" && item.access > 0)) {
      //   console.log("Dashboard access granted.");
      //   window.location.href = "/"+"dashboard";
      // } else {
      //   console.log("Dashboard access denied.");
      //   alert("Access denied!");
      //   // window.location.href = "/";
      // }
    } catch (error) {
      console.error("Error fetching employee access:", error);
      alert("An error occurred while checking access. Please try again later.");
      // window.location.href = "/";
    }
  };
  
  const getAccessForPage = (pageName) => {
    const accessItem = accessData.find((item) => item.page === pageName);
    console.log(`Access for ${pageName}:`, accessItem ? accessItem.access : 0); 
    return accessItem ? accessItem.access : 0;
  };
  
  return (
    <div
      className="flex items-center justify-center min-h-screen sm:p-20 font-[family-name:var(--font-geist-sans)] login-container"
      style={{ height: "100vh", overflowY: "hidden", marginTop: "-50px", gap: "10%", marginLeft: "-14%" }}
    >
      <img 
        src="./assets/loginimg.png" 
        alt="Logo" 
        style={{  
          width: "50%", 
          height: "110%", 
          marginTop:"10%" }}
      />
      <Card
        className="w-[350px]"
        style={{
          backgroundColor: "transparent",
          border: "0.1px solid black",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 1)",
        }}
      >
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }}}
          >
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="emp_id">Employee ID</Label>
                <Input
                  id="emp_id"
                  placeholder="Enter employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  style={{ backgroundColor: "transparent", border: "1px solid black" }}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="psw">Password</Label>
                <Input
                  id="psw"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ backgroundColor: "transparent", border: "1px solid black" }}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleLogin} disabled={isLoading} style={{ width: "100%" }}>
            {isLoading ? "Please wait..." : "Login"}
          </Button>
        </CardFooter>
        {error && (
          <div
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "10px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
        <br />
      </Card>
    </div>
  );
}

"use client";
import * as React from "react";
import { useState } from "react";
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

export default function Home() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  const handleLogin = async () => {
    setError("");
    setIsLoading(true); 

    if (!employeeId || !password) {
      setError("Both Employee ID and Password are required.");
      setIsLoading(false); 
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("employeeId", data.employeeId);
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div style={{ paddingTop: "15%" }} className="flex items-center justify-center max-h-screen sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Card
        className="w-[350px]"
        style={{
          backgroundColor: "transparent",
          border: "0.1px solid black",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 1)",
        }}>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="emp_id">Employee ID</Label>
                <Input
                  id="emp_id"
                  placeholder="enter employee id"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  style={{backgroundColor:"transparent", border:"1px solid black" }}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="psw">Password</Label>
                <Input
                  id="psw"
                  type="password"
                  placeholder="enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{backgroundColor:"transparent", border:"1px solid black"}}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleLogin} style={{ width: "100%" }}>
            {isLoading ? "please wait..." : "Login"} 
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
        )}<br />
      </Card>
    </div>
  );
}
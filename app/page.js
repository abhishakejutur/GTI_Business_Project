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

  const handleLogin = async () => {
    setError("");

    if (!employeeId || !password) {
      setError("Both Employee ID and Password are required.");
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
    }
  };

  return (
    <div style={{ paddingTop: "15%" }} className="flex items-center justify-center max-h-screen sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your login details</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="emp_id">Employee ID</Label>
                <Input
                  id="emp_id"
                  placeholder="enter employee id"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
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
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleLogin} style={{ width: "100%" }}>
            Login
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

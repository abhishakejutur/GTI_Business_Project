"use client";
import localFont from "next/font/local";
import "./globals.css";
import Head from 'next/head';
import Sidebar from "../components/Sidebar";
import Nav from "../components/Nav";
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import { useState, useEffect } from "react";
import 'handsontable/dist/handsontable.full.min.css';
import  secureLocalStorage  from  "react-secure-storage";
// import { handleLogin } from "@/lib/auth";

const geistSans = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(true); 
  const [isMobileView, setIsMobileView] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [emp, setEmp] = useState(null);

  useEffect(() => {
    const user = secureLocalStorage.getItem("nu");
    setEmp(user);

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobileView(true);
        setIsSidebarCollapsed(true);
      } else {
        setIsMobileView(true);
        setIsSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };
  
    loadData();

    return () => {
      // clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prevState) => !prevState);
  };

  return (
    <html lang="en">
      <Head>
        <title>Business</title>
        <meta name="description" content="Business Management" />
        <link href='https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css' rel='stylesheet' />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jspreadsheet-ce/dist/jspreadsheet.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css" />
      </Head>
      <body
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          maxHeight: '100vh',
          maxWidth: '100vw',
          margin: 0,
          position: 'relative',
          overflowY: loading ? 'hidden' : 'auto',
          // overflowY: 'hidden',
          fontFamily: 'Arial Black'
          
        }}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          {/* {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  border: '8px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '8px solid #ffffff',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  animation: 'spin 1s linear infinite',
                }}
              />
            </div>
          )} */}
          <div id="content" style={{ display: 'flex' }}>
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            style={{
              opacity: loading ? 0.5 : 1,
              filter: loading ? 'blur(5px)' : 'none',
              transition: 'opacity 0.3s ease, filter 0.3s ease',
              width: isSidebarCollapsed ? (isMobileView ? '60px' : '80px') : '280px',
              height: '100vh',
              transition: 'width 0.3s ease',
              position: 'fixed',
              overflow: loading ? 'hidden' : 'visible',
            }}
          />
            <div
              id="main-content"
              style={{
                marginLeft: isSidebarCollapsed ? '-200px' : '0px',
                width: `calc(100vw - ${isSidebarCollapsed ? '-200px' : '0px'})`,
                maxWidth: `calc(100vw - ${isSidebarCollapsed ? '-100px' : '0px'})`,
                transition: 'margin-left 0.3s ease',
                flex: 1,
                position: 'relative',
              }}
            >
              <Nav
                toggleSidebar={toggleSidebar}
                onSearch={setSearchQuery}
                emp={emp}
                style={{
                  opacity: loading ? 0.5 : 1,
                  filter: loading ? 'blur(5px)' : 'none',
                  transition: 'opacity 0.3s ease, filter 0.3s ease'
                }}
              />
              <main>{children}</main>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            #main-content {
              margin-left: ${isSidebarCollapsed ? '60px' : '280px'};
              transition: margin-left 0.3s ease;
              flex: 1;
              position: relative;
            }
          }
        `}</style>
      </body>
    </html>
  );
}

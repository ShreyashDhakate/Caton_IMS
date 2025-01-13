"use client";

import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { salesDb } from "../lib/db.ts"; // Import Dexie instance
import { chartConfig } from "./chartConfig.ts"; // Import the chart configuration

// Utility to aggregate data by mode
const aggregateData = (data: any[], mode: "daily" | "monthly" | "annually") => {
  if (mode === "daily") return data;

  const aggregated: { [key: string]: { sales: number; date: string } } = {};

  data.forEach((entry) => {
    const date = new Date(entry.purchase_date);
    const key =
      mode === "monthly"
        ? `${date.getFullYear()}-${date.getMonth() + 1}`
        : `${date.getFullYear()}`;

    if (!aggregated[key]) {
      aggregated[key] = { sales: 0, date: key };
    }

    aggregated[key].sales += entry.total_cost;
  });

  return Object.values(aggregated);
};

const Component: React.FC = () => {
  const [viewMode, setViewMode] = useState<"daily" | "monthly" | "annually">(
    "daily"
  );
  const [salesData, setSalesData] = useState<any[]>([]); // State to hold sales data
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Fetch data from the Dexie database
  const fetchSalesData = async () => {
    try {
      const data = await salesDb.sales.toArray(); // Fetch all sales from the table
      const formattedData = data.map((sale) => ({
        date: new Date(sale.purchase_date).toISOString().split("T")[0], // Format date as YYYY-MM-DD
        sales: sale.total_cost,
      }));
      setSalesData(formattedData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  // Filter data based on the view mode
  useEffect(() => {
    const data = aggregateData(salesData, viewMode);
    setFilteredData(data);
  }, [salesData, viewMode]);

  // Fetch data when the component mounts
  useEffect(() => {
    fetchSalesData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Data</CardTitle>
        <CardDescription>
          View sales data daily, monthly, or annually in INR (₹).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* View mode selector */}
        <div style={{ marginBottom: "1rem" }}>
          {["daily", "monthly", "annually"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as "daily" | "monthly" | "annually")}
              style={{
                marginRight: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: viewMode === mode ? "#1B1833" : "#f0f0f0",
                color: viewMode === mode ? "#fff" : "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Bar Chart */}
        <BarChart width={1500} height={300} data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
          <Legend />
          <Bar
            dataKey="sales"
            fill={chartConfig.sales.color}
            name={chartConfig.sales.label}
          />
        </BarChart>
      </CardContent>
    </Card>
  );
};

export default Component;

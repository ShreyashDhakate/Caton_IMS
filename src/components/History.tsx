"use client";

import React, { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import salesData from "./salesData.json"; // Import the sales data
import { chartConfig } from "./chartConfig"; // Import the chart configuration

// Utility to aggregate data by month and year
const aggregateData = (data: any[], mode: "daily" | "monthly" | "annually") => {
  if (mode === "daily") return data;

  const aggregated: { [key: string]: { sales: number; date: string } } = {};
  
  data.forEach((entry) => {
    const date = new Date(entry.date);
    const key =
      mode === "monthly"
        ? `${date.getFullYear()}-${date.getMonth() + 1}`
        : `${date.getFullYear()}`;

    if (!aggregated[key]) {
      aggregated[key] = { sales: 0, date: key };
    }

    aggregated[key].sales += entry.sales;
  });

  return Object.values(aggregated);
};

const Component: React.FC = () => {
  const [viewMode, setViewMode] = useState<"daily" | "monthly" | "annually">(
    "daily"
  );

  const filteredData = aggregateData(salesData, viewMode);

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
          <button
            onClick={() => setViewMode("daily")}
            style={{
              marginRight: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: viewMode === "daily" ? "#007bff" : "#f0f0f0",
              color: viewMode === "daily" ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            style={{
              marginRight: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: viewMode === "monthly" ? "#007bff" : "#f0f0f0",
              color: viewMode === "monthly" ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode("annually")}
            style={{
              marginRight: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: viewMode === "annually" ? "#007bff" : "#f0f0f0",
              color: viewMode === "annually" ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Annually
          </button>
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

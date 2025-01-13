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
import { salesDb } from "../lib/db.ts"; // Dexie instance
import { chartConfig } from "./chartConfig.ts"; // Chart configuration

// Type definition for sales data and aggregated data
type SaleEntry = {
  purchase_date: string;
  total_cost: number;
  payment_mode: "offline" | "online";
};

type AggregatedSalesData = {
  offline: number;
  online: number;
  date: string;
};

// Utility to aggregate sales data based on the view mode
const aggregateData = (
  data: SaleEntry[],
  mode: "daily" | "monthly" | "annually"
): AggregatedSalesData[] => {
  const aggregated: { [key: string]: AggregatedSalesData } = {};

  data.forEach((entry) => {
    const date = new Date(entry.purchase_date);
    const key =
      mode === "monthly"
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : mode === "annually"
        ? `${date.getFullYear()}`
        : date.toISOString().split("T")[0];

    if (!aggregated[key]) {
      aggregated[key] = { offline: 0, online: 0, date: key };
    }

    if (entry.payment_mode in aggregated[key]) {
      aggregated[key][entry.payment_mode] += entry.total_cost;
    }
  });

  return Object.values(aggregated);
};

const SalesChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<"daily" | "monthly" | "annually">(
    "daily"
  );
  const [salesData, setSalesData] = useState<SaleEntry[]>([]); // Raw sales data
  const [filteredData, setFilteredData] = useState<AggregatedSalesData[]>([]); // Aggregated data

  // Fetch sales data from Dexie
  const fetchSalesData = async () => {
    try {
      const data = await salesDb.sales.toArray();
      const formattedData = data.map((sale) => ({
        purchase_date: sale.purchase_date,
        total_cost: sale.total_cost,
        payment_mode: sale.payment_mode,
      }));
      setSalesData(formattedData);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  // Aggregate data whenever salesData or viewMode changes
  useEffect(() => {
    setFilteredData(aggregateData(salesData, viewMode));
  }, [salesData, viewMode]);

  // Fetch sales data on component mount
  useEffect(() => {
    fetchSalesData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Data</CardTitle>
        <CardDescription>
          View sales data by mode of payment (offline/online) grouped daily,
          monthly, or annually.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* View mode selector */}
        <div style={{ marginBottom: "1rem" }}>
          {["daily", "monthly", "annually"].map((mode) => (
            <button
              key={mode}
              onClick={() =>
                setViewMode(mode as "daily" | "monthly" | "annually")
              }
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
        <BarChart width={1500} height={400} data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <Tooltip
            formatter={(value: number) => `₹${value.toLocaleString()}`}
          />
          <Legend />
          <Bar
            dataKey="offline"
            fill={chartConfig.offline.color}
            name={chartConfig.offline.label}
          />
          <Bar
            dataKey="online"
            fill={chartConfig.online.color}
            name={chartConfig.online.label}
          />
        </BarChart>
      </CardContent>
    </Card>
  );
};

export default SalesChart;

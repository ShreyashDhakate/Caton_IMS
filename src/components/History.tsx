"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import salesData from "./salesData.json"; // Import the sales data
import { chartConfig } from "./Chartconfig"; // Import the chart configuration

const Component: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Data</CardTitle>
        <CardDescription>Daily sales in INR (₹).</CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart width={1500} height={300} data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
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

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Dataset } from "@/types";

interface DatasetContextValue {
  datasets: Dataset[];
  selectedDatasetId: number | null;
  selectedDataset: Dataset | undefined;
  setSelectedDatasetId: (id: number | null) => void;
  refreshDatasets: (selectLatest?: boolean) => Promise<void>;
  loadingDatasets: boolean;
}

const DatasetContext = createContext<DatasetContextValue | undefined>(undefined);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(false);

  const refreshDatasets = useCallback(async (selectLatest = false) => {
    try {
      setLoadingDatasets(true);
      const data = await api.getDatasets();
      setDatasets(data);
      if (data.length > 0) {
        setSelectedDatasetId((prev) => {
          if (selectLatest) return data[0].id;
          if (prev !== null && data.some((d) => d.id === prev)) return prev;
          return data[0].id;
        });
      } else {
        setSelectedDatasetId(null);
      }
    } catch (err) {
      console.error("Failed to load datasets:", err);
    } finally {
      setLoadingDatasets(false);
    }
  }, []);

  useEffect(() => {
    refreshDatasets();
  }, [refreshDatasets]);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        selectedDatasetId,
        selectedDataset,
        setSelectedDatasetId,
        refreshDatasets,
        loadingDatasets,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) {
    throw new Error("useDataset must be used within a DatasetProvider");
  }
  return ctx;
}

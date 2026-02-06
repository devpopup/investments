"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FREQUENCIES, DURATION_OPTIONS } from "@/lib/constants";
import type { AssetInfo, DCARequest } from "@/lib/types";

interface DCAFormProps {
  assets: AssetInfo[];
  onSubmit: (req: DCARequest) => void;
  isLoading: boolean;
}

export function DCAForm({ assets, onSubmit, isLoading }: DCAFormProps) {
  const [assetId, setAssetId] = useState(assets[0]?.id || "bitcoin");
  const [amount, setAmount] = useState("500");
  const [frequency, setFrequency] = useState<DCARequest["frequency"]>("monthly");
  const [duration, setDuration] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      asset_id: assetId,
      amount: parseFloat(amount),
      frequency,
      duration_years: parseInt(duration),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Asset"
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
        options={assets.map((a) => ({ value: a.id, label: `${a.name} (${a.symbol})` }))}
      />
      <Input
        label="Investment Amount ($)"
        type="number"
        min="1"
        step="1"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Select
        label="Frequency"
        value={frequency}
        onChange={(e) => setFrequency(e.target.value as DCARequest["frequency"])}
        options={FREQUENCIES.map((f) => ({ value: f.value, label: f.label }))}
      />
      <Select
        label="Duration (Years)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        options={DURATION_OPTIONS.map((d) => ({ value: String(d), label: `${d} year${d > 1 ? "s" : ""}` }))}
      />
      <Button type="submit" disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Calculating..." : "Run Projection"}
      </Button>
    </form>
  );
}

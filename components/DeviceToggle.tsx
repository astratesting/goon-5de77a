"use client";

import SegmentedControl from "./ui/SegmentedControl";

const DEVICE_OPTIONS = [
  { label: "Mobile 375", value: "375" },
  { label: "Mobile 414", value: "414" },
  { label: "Tablet 768", value: "768" },
  { label: "Desktop 1280", value: "1280" },
];

interface DeviceToggleProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DeviceToggle({ value, onChange }: DeviceToggleProps) {
  return (
    <SegmentedControl
      options={DEVICE_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}

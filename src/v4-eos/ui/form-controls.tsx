import * as React from "react";
import { Input } from "@/v4-eos/ui/input";
import { Textarea as ShadTextarea } from "@/v4-eos/ui/textarea";
import { Checkbox as ShadCheckbox } from "@/v4-eos/ui/checkbox";
import { Switch as ShadSwitch } from "@/v4-eos/ui/switch";
import { RadioGroup as ShadRadioGroup, RadioGroupItem } from "@/v4-eos/ui/radio-group";
import { Label } from "@/v4-eos/ui/label";
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/v4-eos/ui/select";
import { cn } from "@/v4-eos/ui/lib/utils";

// V2-local form-control adapters. They wrap the shadcn primitives behind the
// value/onChange/options API the Properties body already speaks, so the region
// code stays declarative and never imports Radix directly (§10). Compact
// Iceberg density: 28px controls, restrained radius, subtle dark input fills.

// Compact Iceberg density with a clear field affordance: a recessed subtle fill
// (M3 Surface Container) reads as an editable well against the lighter panel,
// the outline comes from border-input (the strong outline role), and focus
// lifts the fill to plain surface plus the blue ring.
const FIELD =
  "h-7 rounded-sm bg-[var(--color-bg-subtle)] text-[13px] focus-visible:bg-[var(--color-bg-surface)]";

export function TextField(
  props: React.ComponentProps<typeof Input> & { invalid?: boolean },
) {
  const { invalid, className, ...rest } = props;
  return (
    <Input
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(FIELD, className)}
    />
  );
}

export function TextAreaField(
  props: React.ComponentProps<typeof ShadTextarea> & { invalid?: boolean },
) {
  const { invalid, className, ...rest } = props;
  return (
    <ShadTextarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(
        "min-h-16 rounded-sm bg-[var(--color-bg-subtle)] text-[13px] focus-visible:bg-[var(--color-bg-surface)]",
        className,
      )}
    />
  );
}

export function CheckboxField({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <ShadCheckbox checked={checked} onCheckedChange={(v) => onCheckedChange?.(!!v)} />
  );
}

export function SwitchField({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange?: (v: boolean) => void;
}) {
  return <ShadSwitch checked={checked} onCheckedChange={onCheckedChange} />;
}

type SelectFieldOption = string | { label: string; value: string };

const normalizeOption = (o: SelectFieldOption) =>
  typeof o === "string" ? { label: o, value: o } : o;

// The single app dropdown (light shadcn/Radix Select). Used by the Properties
// panel AND the preview toolbar so every dropdown looks and behaves the same.
// Accepts plain strings (label === value) or { label, value } pairs.
export function SelectField({
  id,
  value,
  onValueChange,
  options,
  invalid,
  placeholder = "Select…",
  triggerClassName,
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  onValueChange?: (v: string) => void;
  options: SelectFieldOption[];
  invalid?: boolean;
  placeholder?: string;
  triggerClassName?: string;
  "aria-label"?: string;
}) {
  return (
    <ShadSelect value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger
        id={id}
        size="sm"
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        className={cn(FIELD, "w-full", triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((raw) => {
          const opt = normalizeOption(raw);
          return (
            <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
              {opt.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </ShadSelect>
  );
}

export function RadioField({
  name,
  value,
  onValueChange,
  options,
}: {
  name: string;
  value: string;
  onValueChange?: (v: string) => void;
  options: string[];
}) {
  return (
    <ShadRadioGroup
      name={name}
      value={value}
      onValueChange={onValueChange}
      className="gap-1.5"
    >
      {options.map((opt) => {
        const optId = `${name}-${opt}`;
        return (
          <div key={opt} className="flex items-center gap-2">
            <RadioGroupItem id={optId} value={opt} />
            <Label htmlFor={optId} className="text-[13px] font-normal">
              {opt}
            </Label>
          </div>
        );
      })}
    </ShadRadioGroup>
  );
}

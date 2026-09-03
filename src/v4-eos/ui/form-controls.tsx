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

const FIELD = "h-7 rounded-sm bg-[var(--color-bg-control)] text-[13px]";

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
        "min-h-16 rounded-sm bg-[var(--color-bg-control)] text-[13px]",
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

export function SelectField({
  id,
  value,
  onValueChange,
  options,
  invalid,
}: {
  id?: string;
  value: string;
  onValueChange?: (v: string) => void;
  options: string[];
  invalid?: boolean;
}) {
  return (
    <ShadSelect value={value || undefined} onValueChange={onValueChange}>
      <SelectTrigger
        id={id}
        size="sm"
        aria-invalid={invalid || undefined}
        className={cn(FIELD, "w-full bg-[var(--color-bg-control)]")}
      >
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className="text-[13px]">
            {opt}
          </SelectItem>
        ))}
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

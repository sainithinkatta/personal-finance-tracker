import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateDueData, Due } from "@/types/due";

interface DueFormProps {
  onSubmit: (data: CreateDueData) => void;
  onClose: () => void;
  initialData?: Due;
  isLoading?: boolean;
  formId?: string;
  hideActions?: boolean;
}

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return "";
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const DueForm: React.FC<DueFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  isLoading = false,
  formId,
  hideActions = false,
}) => {
  const [formData, setFormData] = useState<CreateDueData>({
    type: initialData?.type || "I Owe",
    person_name: initialData?.person_name || "",
    amount: initialData?.amount || 0,
    currency: initialData?.currency || "USD",
    due_date: formatDateForInput(initialData?.due_date) || "",
    notes: initialData?.notes || "",
    status: initialData?.status || "Pending",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        person_name: initialData.person_name,
        amount: initialData.amount,
        currency: initialData.currency,
        due_date: formatDateForInput(initialData.due_date) || "",
        notes: initialData.notes || "",
        status: initialData.status,
      });
    }
  }, [initialData]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  const handleFieldChange = <T extends keyof CreateDueData>(field: T, value: CreateDueData[T]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    formData.person_name.trim() !== "" &&
    Number(formData.amount) > 0 &&
    formData.due_date !== "";

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="space-y-3"
      autoComplete="off"
    >
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="due-type">
          Type
        </label>
        <Select
          value={formData.type}
          onValueChange={(value: "I Owe" | "They Owe Me") => handleFieldChange("type", value)}
        >
          <SelectTrigger
            id="due-type"
            className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="text-[15px]">
            <SelectItem value="I Owe">I Owe</SelectItem>
            <SelectItem value="They Owe Me">They Owe Me</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="due-person">
          Person's name
        </label>
        <Input
          id="due-person"
          value={formData.person_name}
          onChange={(event) => handleFieldChange("person_name", event.target.value)}
          placeholder="Enter person's name"
          className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="due-amount">
            Amount
          </label>
          <Input
            id="due-amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(event) => handleFieldChange("amount", parseFloat(event.target.value) || 0)}
            placeholder="0.00"
            className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="due-currency">
            Currency
          </label>
          <Select
            value={formData.currency}
            onValueChange={(value: "USD" | "INR") => handleFieldChange("currency", value)}
          >
            <SelectTrigger
              id="due-currency"
              className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
            >
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="text-[15px]">
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="due-date">
          Due date
        </label>
        <Input
          id="due-date"
          type="date"
          value={formData.due_date}
          onChange={(event) => handleFieldChange("due_date", event.target.value)}
          className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="due-status">
            Status
          </label>
          <Select
            value={formData.status}
            onValueChange={(value: "Pending" | "Settled") => handleFieldChange("status", value)}
          >
            <SelectTrigger
              id="due-status"
              className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-[15px]">
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Settled">Settled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="due-notes">
          Notes (optional)
        </label>
        <Textarea
          id="due-notes"
          value={formData.notes}
          onChange={(event) => handleFieldChange("notes", event.target.value)}
          placeholder="e.g., Split lunch, Lent for books"
          className="min-h-[96px] resize-none rounded-2xl border border-muted-foreground/30 px-3 py-2 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
        />
      </div>

      {!hideActions && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-muted-foreground/20 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="h-11 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Saving..." : initialData ? "Update Due" : "Add Due"}
          </button>
        </div>
      )}
    </form>
  );
};

export default DueForm;

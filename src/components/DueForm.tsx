import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
}

const DueForm: React.FC<DueFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  isLoading,
}) => {
  // Format initial due_date to ensure it's in YYYY-MM-DD format for the date input
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    // If it's already in YYYY-MM-DD format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Otherwise, try to parse and format correctly
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState<CreateDueData>({
    type: initialData?.type || "I Owe",
    person_name: initialData?.person_name || "",
    amount: initialData?.amount || 0,
    currency: initialData?.currency || "USD",
    due_date: formatDateForInput(initialData?.due_date) || "",
    notes: initialData?.notes || "",
    status: initialData?.status || "Pending",
  });

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.type &&
      formData.person_name.trim() !== "" &&
      formData.amount > 0 &&
      formData.currency &&
      formData.due_date &&
      formData.due_date.trim() !== "" &&
      formData.status
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      return;
    }
    // Ensure due_date is passed as a clean YYYY-MM-DD string
    const submitData = {
      ...formData,
      due_date: formData.due_date,
    };
    onSubmit(submitData);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Directly use the value from the date input, which is already in YYYY-MM-DD format
    setFormData({ ...formData, due_date: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value: "I Owe" | "They Owe Me") =>
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="I Owe">I Owe</SelectItem>
            <SelectItem value="They Owe Me">They Owe Me</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="person_name">Person's Name *</Label>
        <Input
          id="person_name"
          value={formData.person_name}
          onChange={(e) =>
            setFormData({ ...formData, person_name: e.target.value })
          }
          placeholder="Enter person's name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency *</Label>
          <Select
            value={formData.currency}
            onValueChange={(value: "USD" | "INR") =>
              setFormData({ ...formData, currency: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="due_date">Due Date *</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={handleDateChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select
          value={formData.status}
          onValueChange={(value: "Pending" | "Settled") =>
            setFormData({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Settled">Settled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="e.g., Split lunch, Lent for books"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isFormValid()}
          className={`bg-blue-500 hover:bg-blue-600 ${
            isLoading || !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Saving..." : initialData ? "Update Due" : "Add Due"}
        </Button>
      </div>
    </form>
  );
};

export default DueForm;

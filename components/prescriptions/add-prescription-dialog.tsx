"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

type AddPrescriptionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPrescriptionDialog({ open, onOpenChange }: AddPrescriptionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    patientName: "",
    prescribedBy: "",
    medicines: "",
    validUntil: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)
      setFormData({
        patientName: "",
        prescribedBy: "",
        medicines: "",
        validUntil: "",
        notes: "",
      })
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record New Prescription</DialogTitle>
          <DialogDescription>Add a new prescription record with patient and medicine details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                placeholder="John Smith"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prescribedBy">Prescribed By</Label>
              <Input
                id="prescribedBy"
                placeholder="Dr. Sarah Williams"
                value={formData.prescribedBy}
                onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medicines">Medicines</Label>
              <Textarea
                id="medicines"
                placeholder="List medicines (one per line)"
                value={formData.medicines}
                onChange={(e) => setFormData({ ...formData, medicines: e.target.value })}
                required
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                "Record Prescription"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

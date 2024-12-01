"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ReservationWithCourt } from "@/lib/db/schema";

interface CancelReservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  reservation: ReservationWithCourt;
  loading?: boolean;
}

export function CancelReservationModal({
  open,
  onOpenChange,
  onConfirm,
  reservation,
  loading,
}: CancelReservationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Reservation</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your reservation for{" "}
            {format(new Date(reservation.startTime), "PPP")} at{" "}
            {format(new Date(reservation.startTime), "p")}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Reservation
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Cancelling..." : "Cancel Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

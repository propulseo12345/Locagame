import { ReservationsCreation } from './reservations.creation';
import { ReservationsQueries } from './reservations.queries';
import { ReservationsPayments } from './reservations.payments';
import { ReservationsAdmin } from './reservations.admin';

export class ReservationsService {
  static createReservation = ReservationsCreation.createReservation;
  static getCustomerReservations = ReservationsQueries.getCustomerReservations;
  static getReservationById = ReservationsQueries.getReservationById;
  static getAllReservations = ReservationsQueries.getAllReservations;
  static updatePaymentStatus = ReservationsPayments.updatePaymentStatus;
  static syncPaymentWithStripe = ReservationsPayments.syncPaymentWithStripe;
  static updateReservationStatus = ReservationsAdmin.updateReservationStatus;
  static cancelReservation = ReservationsAdmin.cancelReservation;
  static refundDeposit = ReservationsAdmin.refundDeposit;
  static getUnassignedReservations = ReservationsAdmin.getUnassignedReservations;
}

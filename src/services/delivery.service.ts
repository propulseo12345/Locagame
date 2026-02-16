/**
 * Service de livraison LOCAGAME - Facade
 *
 * Re-exports depuis les sous-modules pour compatibilité ascendante.
 * - deliveryZones.service.ts : CRUD zones de livraison
 * - deliveryTasks.service.ts : CRUD tâches de livraison
 */

import { DeliveryZonesService } from './deliveryZones.service';
import { DeliveryTasksService } from './deliveryTasks.service';

/**
 * Facade combinant les services zones et tâches de livraison.
 * Conserve l'API publique originale pour compatibilité ascendante.
 */
export class DeliveryService {
  // === Zone methods (delegate to DeliveryZonesService) ===
  static getDeliveryZones = DeliveryZonesService.getDeliveryZones;
  static findZoneByPostalCode = DeliveryZonesService.findZoneByPostalCode;
  static createZone = DeliveryZonesService.createZone;
  static updateZone = DeliveryZonesService.updateZone;
  static deleteZone = DeliveryZonesService.deleteZone;

  // === Task methods (delegate to DeliveryTasksService) ===
  static getTechnicianTasks = DeliveryTasksService.getTechnicianTasks;
  static getTaskById = DeliveryTasksService.getTaskById;
  static updateTaskStatus = DeliveryTasksService.updateTaskStatus;
  static createDeliveryTask = DeliveryTasksService.createDeliveryTask;
  static getTasksByDate = DeliveryTasksService.getTasksByDate;
  static assignTask = DeliveryTasksService.assignTask;
  static getAllTasks = DeliveryTasksService.getAllTasks;
  static unassignTask = DeliveryTasksService.unassignTask;
  static deleteTask = DeliveryTasksService.deleteTask;
}

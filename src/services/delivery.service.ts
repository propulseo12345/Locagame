import { DeliveryZonesService } from './delivery.zones';
import { DeliveryTasksService } from './delivery.tasks';
import { DeliveryTask, DeliveryZone } from '../types';

export class DeliveryService {
  // Zones
  static getDeliveryZones = DeliveryZonesService.getDeliveryZones;
  static findZoneByPostalCode = DeliveryZonesService.findZoneByPostalCode;
  static createZone = DeliveryZonesService.createZone;
  static updateZone = DeliveryZonesService.updateZone;
  static deleteZone = DeliveryZonesService.deleteZone;
  // Tasks
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

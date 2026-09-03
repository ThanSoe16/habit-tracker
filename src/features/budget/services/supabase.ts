import { budgetMaintenanceService } from './budget-maintenance-service';
import { budgetReadService } from './budget-read-service';
import { budgetWriteService } from './budget-write-service';

export const budgetService = {
  ...budgetReadService,
  ...budgetWriteService,
  ...budgetMaintenanceService,
};

import { Router } from 'express';
import { HistoryController } from '../controller';

const historyRouter = Router();
historyRouter.post('/', HistoryController.create);
historyRouter.get('/:serviceId/:year/:month', HistoryController.findByMonth);
historyRouter.put('/', HistoryController.update);
historyRouter.delete('/', HistoryController.remove);
historyRouter.post('/bulk', HistoryController.bulkInsert);

export default historyRouter;

import express from "express"
import { createWarehouse,getWarehouse,addStock,decrementStock,getStock,getLowStock ,searchStock,getEligibleWarehouses} from "../Controllers/warehouse.controller.js";
const router = express.Router()
router.post('/', createWarehouse);
router.get('/low-stock', getLowStock);
router.get('/search', searchStock);
router.get("/eligible/:predictedAidId", getEligibleWarehouses);
router.get('/:id', getWarehouse);
router.post('/:id/stock', addStock);
router.put('/:id/stock/decrement', decrementStock);
router.get('/:id/stock', getStock);




export default router
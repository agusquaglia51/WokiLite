import express from "express";
import { RestaurantService } from "../services/restaurant.service.js";
import { TableService } from "../services/table.service.js";
import { SectorService } from "../services/sector.service.js";
import { Table } from "../types/types.js";
import { logger } from "../logger.js";


const router = express.Router();

router.get("/", async (req, res) => {
  const startTime = Date.now();
  try {
    
    logger.info({
      operation: 'list_restaurants'
    }, 'Fetching all restaurants');

    const restaurantList = await RestaurantService.getRestaurantList();

    if (!restaurantList) {
      const durationMs = Date.now() - startTime;

      logger.warn({
        durationMs,
        operation: 'list_restaurants',
        outcome: 'not_found'
      }, 'No restaurants found');

      return res.status(404).json({ message: "Not found" });
    }

     const durationMs = Date.now() - startTime;

    logger.info({
      restaurantCount: restaurantList.length,
      durationMs,
      operation: 'list_restaurants',
      outcome: 'success'
    }, 'Restaurants fetched successfully');

    res.status(200).json(restaurantList);
    
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      durationMs,
      operation: 'list_restaurants',
      outcome: 'error'
    }, 'Error fetching restaurants');

    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const startTime = Date.now();

  try {
    const {id} = req.params

    logger.info({
      restaurantId: id,
      operation: 'get_restaurant'
    }, 'Fetching restaurant');

    const restaurant = await RestaurantService.getRestaurant(id);

    if (!restaurant) {
      const durationMs = Date.now() - startTime;

      logger.warn({
        restaurantId: id,
        durationMs,
        operation: 'get_restaurant',
        outcome: 'not_found'
      }, 'Restaurant not found');

      return res.status(404).json({ message: "Not found" });
    }

    const durationMs = Date.now() - startTime;

    logger.info({
      restaurantId: id,
      restaurantName: restaurant.name,
      durationMs,
      operation: 'get_restaurant',
      outcome: 'success'
    }, 'Restaurant fetched successfully');

    res.status(200).json(restaurant);
    
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error({
      restaurantId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      durationMs,
      operation: 'get_restaurant',
      outcome: 'error'
    }, 'Error fetching restaurant');

    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/sectors", async (req, res) => {
   const startTime = Date.now();
  try {
    const { id } = req.params;

    logger.info({
      restaurantId: id,
      operation: 'list_sectors'
    }, 'Fetching sectors');


    const sectors = await SectorService.getByRestaurantId(id);

    const durationMs = Date.now() - startTime;

    logger.info({
      restaurantId: id,
      sectorCount: sectors.length,
      durationMs,
      operation: 'list_sectors',
      outcome: 'success'
    }, 'Sectors fetched successfully');

    res.status(200).json(sectors);
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error({
      restaurantId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      durationMs,
      operation: 'list_sectors',
      outcome: 'error'
    }, 'Error fetching sectors');

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/tables", async (req, res) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;

    logger.info({
      restaurantId: id,
      operation: 'list_tables'
    }, 'Fetching tables');

    const sectors = await SectorService.getByRestaurantId(id);


    const tablesPerSector = await Promise.all(
      sectors.map((s) => TableService.getTablesBySector(s.id))
    );
    

    const tables: Table[] = tablesPerSector.flat();

    const durationMs = Date.now() - startTime;

    logger.info({
      restaurantId: id,
      sectorCount: sectors.length,
      tableCount: tables.length,
      durationMs,
      operation: 'list_tables',
      outcome: 'success'
    }, 'Tables fetched successfully');

    res.status(200).json(
      tables.map((t) => ({
        id: t.id,
        sectorId: t.sectorId,
        name: t.name,
        minSize: t.minSize,
        maxSize: t.maxSize,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error({
      restaurantId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      durationMs,
      operation: 'list_tables',
      outcome: 'error'
    }, 'Error fetching tables');

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
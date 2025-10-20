import express from "express";
import { RestaurantService } from "../services/restaurant.service";
import { TableService } from "../services/table.service";
import { SectorService } from "../services/sector.service";
import { Table } from "../types/types";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    
    const restaurantList = await RestaurantService.getRestaurantList();

    if(!restaurantList){
      res.status(404).json({message: "Not found"})
    }

    res.status(200).json(restaurantList);
    
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Internal server error"})
  }
});

router.get("/:id", async (req, res) => {
  try {
    const {id} = req.params

    const restaurant = await RestaurantService.getRestaurant(id);

    if(!restaurant){
      res.status(404).json({message: "Not found"})
    }

    res.status(200).json(restaurant);
    
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Internal server error"})
  }
});

router.get("/:id/sectors", async (req, res) => {
  try {
    const { id } = req.params;

    const sectors = await SectorService.getByRestaurantId(id);

    res.status(200).json(sectors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id/tables", async (req, res) => {
  try {
    const { id } = req.params;

    const sectors = await SectorService.getByRestaurantId(id);


    const tablesPerSector = await Promise.all(
      sectors.map((s) => TableService.getTablesBySector(s.id))
    );
    

    const tables: Table[] = tablesPerSector.flat();

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
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
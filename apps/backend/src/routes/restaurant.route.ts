import express from "express";
import { RestaurantService } from "../services/restaurant.service";


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

export default router;
import { RestaurantRepository } from "../repositories/restaurant.repository";

export class RestaurantService {

  static async getRestaurantList(){
    const restaurantList =  await RestaurantRepository.findAll();

    return restaurantList
  }

  static async getRestaurant(id: string){
    const restaurant = await RestaurantRepository.findById(id);

    return restaurant;
  }
}
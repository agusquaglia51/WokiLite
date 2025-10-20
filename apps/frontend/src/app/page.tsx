import RestaurantCard from "./components/RestaurantCard";
import Link from "next/link";
import SearchBox from "./components/SearchBox";
import { Restaurant } from "./types";
import { RestaurantService } from "./services/restaurant.service";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const restaurants = await RestaurantService.fetchRestaurants();
  return (
    <section>
      <section className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.length > 0 &&
          restaurants.map((restaurant: Restaurant) => {
            return (
              <Link
                prefetch={false}
                href={`/${restaurant.id}`}
                key={restaurant.id}
              >
                <RestaurantCard restaurant={restaurant} />
              </Link>
            );
          })}
      </section>
      {restaurants.length <= 0 && (
        <div className="flex mt-48 justify-center content-center w-full">
          <h1 className="inline-flex gap-2 text-md font-semi-bold">
            Restaurant not found
          </h1>
        </div>
      )}
    </section>
  );
}

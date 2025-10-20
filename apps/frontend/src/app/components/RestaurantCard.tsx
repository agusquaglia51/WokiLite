"use client";
import React from "react";
import { Restaurant } from "../types";
import { getImageUrl } from "../utils";

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {

  return (
    <article
      key={restaurant.id}
      className="overflow-hidden rounded-2xl shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg bg-neutral-200"
    >
      <img
        alt={restaurant.name}
        src={getImageUrl(restaurant.id)}
        className="h-60 w-full object-cover"
      />

      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900">
          <p>{restaurant.name}</p>
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Zona horaria:{" "}
          <span className="font-medium">{restaurant.timezone}</span>
        </p>

        {restaurant.shifts && restaurant.shifts.length > 0 && (
          <div className="mt-3">
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              Horarios:
            </h3>
            <ul className="text-sm text-gray-600">
              {restaurant.shifts.map((shift, index) => (
                <li key={index}>
                  {shift.start} - {shift.end}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

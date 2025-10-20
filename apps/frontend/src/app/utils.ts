export const getImageUrl =(id: string) : string => {
  const restaurantImages: Record<string, string> = {
    R1: "/default.jpeg",
    R2: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
    R3: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80",
    R4: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
  };
  
  return restaurantImages[id];
}
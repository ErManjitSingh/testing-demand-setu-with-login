const DEFAULT_STATE_IMAGE =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80";

export const STATE_IMAGE_MAP = {
  "Andhra Pradesh":
    "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1200&q=80",
  "Arunachal Pradesh":
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80",
  Assam:
    "https://images.pexels.com/photos/10348767/pexels-photo-10348767.jpeg",
  Chandigarh:
    "https://images.pexels.com/photos/31103717/pexels-photo-31103717.jpeg",
  Darjeeling:
    "https://images.pexels.com/photos/28170573/pexels-photo-28170573.jpeg",
  Delhi:
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80",
  Goa:
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
  Gujarat:
    "https://images.pexels.com/photos/34568381/pexels-photo-34568381.jpeg",
  Haryana:
    "https://images.pexels.com/photos/37172420/pexels-photo-37172420.jpeg",
  Himachal:
    "https://images.pexels.com/photos/32702512/pexels-photo-32702512.jpeg",
  "Himachal Pradesh":
    "https://images.pexels.com/photos/32702512/pexels-photo-32702512.jpeg",
  "Jammu & Kashmir":
    "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&q=80",
  Karnataka:
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&q=80",
  Kerala:
    "https://images.pexels.com/photos/12313299/pexels-photo-12313299.jpeg",
  Ladakh:
    "https://images.pexels.com/photos/6650454/pexels-photo-6650454.jpeg",
  "Madhya Pradesh":
    "https://images.pexels.com/photos/36588442/pexels-photo-36588442.jpeg",
  Maharashtra:
    "https://images.pexels.com/photos/15256197/pexels-photo-15256197.jpeg",
  Meghalaya:
    "https://images.pexels.com/photos/18158726/pexels-photo-18158726.jpeg",
  Mizoram:
    "https://images.pexels.com/photos/18141204/pexels-photo-18141204.jpeg",
  Odisha:
    "https://images.pexels.com/photos/36392913/pexels-photo-36392913.jpeg",
  Pondicherry:
    "https://images.pexels.com/photos/31790332/pexels-photo-31790332.jpeg",
  Punjab:
    "https://images.pexels.com/photos/5499899/pexels-photo-5499899.jpeg",
  Rajasthan:
    "https://images.pexels.com/photos/29231351/pexels-photo-29231351.jpeg",
  Sikkim:
    "https://images.pexels.com/photos/17332516/pexels-photo-17332516.jpeg",
  "Sri Lanka":
    "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=1200&q=80",
  "Tamil Nadu":
    "https://images.pexels.com/photos/12388203/pexels-photo-12388203.jpeg",
  Telangana:
    "https://images.pexels.com/photos/33813000/pexels-photo-33813000.jpeg",
  Thailand:
    "https://images.pexels.com/photos/2611495/pexels-photo-2611495.jpeg",
  Tirupati:
    "https://images.pexels.com/photos/29253067/pexels-photo-29253067.jpeg",
  "Uttar Pradesh":
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80",
  Uttarakhand:
    "https://images.pexels.com/photos/14149541/pexels-photo-14149541.jpeg",
  "West Bengal":
    "https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?w=1200&q=80",
};

export function getStateImage(stateName) {
  return STATE_IMAGE_MAP[stateName] || DEFAULT_STATE_IMAGE;
}

"use client";

export const tabs = [
    { label: "B2C", value: "b2c" },
    { label: "WEBSITE", value: "website" },
    { label: "B2B", value: "b2b" },
  ];
  
export  const rateTypes = {
    b2c: [
      { name: "EP", hasLinkage: false },
      { name: "CP", hasLinkage: false },
      { name: "MAP", hasLinkage: true },
      { name: "AP", hasLinkage: true },
      
    ],
    website: [
      { name: "EP", hasLinkage: false },
      { name: "CP", hasLinkage: false },
      { name: "MAP", hasLinkage: true },
      { name: "AP", hasLinkage: true },
    ],
    b2b: [
      { name: "EP", hasLinkage: false },
      { name: "CP", hasLinkage: false },
      { name: "MAP", hasLinkage: true },
      { name: "AP", hasLinkage: true },
    ],
  };
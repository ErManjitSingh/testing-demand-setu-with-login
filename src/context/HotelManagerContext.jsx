"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePartnerAuth } from "@/hooks/usePartnerAuth";
import { getMyWebsitePackagemaker, normalizePartnerPropertyList } from "@/lib/packagemakerPartnerApi";

const HotelManagerContext = createContext(null);

export const useHotelManager = () => {
  const ctx = useContext(HotelManagerContext);
  if (!ctx) {
    throw new Error("useHotelManager must be used within HotelManagerProvider");
  }
  return ctx;
};

function normalizePropertyList(payload) {
  return normalizePartnerPropertyList(payload);
}

export function HotelManagerProvider({ children }) {
  const { isLoggedIn } = usePartnerAuth();
  const [propertiesbasicinfo, setPropertiesbasicinfo] = useState([]);
  const [isLoadingbasicinfo, setIsLoadingbasicinfo] = useState(true);
  const [totalHotelsbasicinfo, setTotalHotelsbasicinfo] = useState(0);

  const fetchMyProperties = useCallback(async () => {
    const data = await getMyWebsitePackagemaker();
    const list = normalizePropertyList(data);
    setPropertiesbasicinfo(list);
    setTotalHotelsbasicinfo(
      data?.pagination?.totalProperties ?? data?.total ?? list.length
    );
    return list;
  }, []);

  const refreshPropertiesBasicinfo = useCallback(async () => {
    setIsLoadingbasicinfo(true);
    try {
      await fetchMyProperties();
    } catch (error) {
      console.error("Error fetching partner properties:", error);
      setPropertiesbasicinfo([]);
      setTotalHotelsbasicinfo(0);
    } finally {
      setIsLoadingbasicinfo(false);
    }
  }, [fetchMyProperties]);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoadingbasicinfo(false);
      setPropertiesbasicinfo([]);
      setTotalHotelsbasicinfo(0);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoadingbasicinfo(true);
      try {
        await fetchMyProperties();
      } catch (error) {
        console.error("Error fetching partner properties:", error);
        if (!cancelled) {
          setPropertiesbasicinfo([]);
          setTotalHotelsbasicinfo(0);
        }
      } finally {
        if (!cancelled) setIsLoadingbasicinfo(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, fetchMyProperties]);

  return (
    <HotelManagerContext.Provider
      value={{
        properties: propertiesbasicinfo,
        isLoading: isLoadingbasicinfo,
        totalHotels: totalHotelsbasicinfo,
        propertiesbasicinfo,
        isLoadingbasicinfo,
        totalHotelsbasicinfo,
        refreshPropertiesBasicinfo,
      }}
    >
      {children}
    </HotelManagerContext.Provider>
  );
}

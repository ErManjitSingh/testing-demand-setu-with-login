import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import {
  normalizeCityName,
  normalizeLocationList,
  normalizeStateName,
} from "@/lib/locationCatalog";

const CACHE_TTL_MS = 30 * 60 * 1000;

export const fetchHotelCities = createAsyncThunk(
  "locations/fetchHotelCities",
  async () => {
    const response = await fetchWithTimeout(
      buildApiUrl("api/packagemaker//get-packagemaker-hotel-cities"),
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch cities (${response.status})`);
    }

    const payload = await response.json();
    if (!payload?.success || !Array.isArray(payload.data)) {
      throw new Error("Invalid city API response");
    }

    return normalizeLocationList(payload.data, normalizeCityName);
  },
  {
    condition: (_, { getState }) => {
      const { locations } = getState();
      if (!locations) return true;
      if (locations.status === "loading") return false;
      if (!locations.lastFetched) return true;
      return Date.now() - locations.lastFetched > CACHE_TTL_MS;
    },
  }
);

export const fetchHotelStates = createAsyncThunk(
  "locations/fetchHotelStates",
  async () => {
    const response = await fetchWithTimeout(
      buildApiUrl("api/packagemaker//get-packagemaker-hotel-states"),
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch states (${response.status})`);
    }

    const payload = await response.json();
    if (!payload?.success || !Array.isArray(payload.data)) {
      throw new Error("Invalid states API response");
    }

    return normalizeLocationList(payload.data, normalizeStateName);
  },
  {
    condition: (_, { getState }) => {
      const { locations } = getState();
      if (!locations) return true;
      if (locations.statesStatus === "loading") return false;
      if (!locations.statesLastFetched) return true;
      return Date.now() - locations.statesLastFetched > CACHE_TTL_MS;
    },
  }
);

const locationSlice = createSlice({
  name: "locations",
  initialState: {
    cities: [],
    status: "idle",
    error: null,
    lastFetched: null,
    states: [],
    statesStatus: "idle",
    statesError: null,
    statesLastFetched: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotelCities.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchHotelCities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cities = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchHotelCities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Unable to load locations";
      })
      .addCase(fetchHotelStates.pending, (state) => {
        state.statesStatus = "loading";
        state.statesError = null;
      })
      .addCase(fetchHotelStates.fulfilled, (state, action) => {
        state.statesStatus = "succeeded";
        state.states = action.payload;
        state.statesLastFetched = Date.now();
      })
      .addCase(fetchHotelStates.rejected, (state, action) => {
        state.statesStatus = "failed";
        state.statesError = action.error?.message || "Unable to load states";
      });
  },
});

export const locationsReducer = locationSlice.reducer;

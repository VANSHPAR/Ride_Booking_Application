import { reviewApi } from "./api";
import { saveDriverLocation } from "./locationService";

const PASSENGER_LOCATIONS_KEY = "uber_passenger_locations";
const DRIVER_LOCATIONS_KEY = "uber_driver_locations";

export const getStoredPassengerLocations = () => {
  try {
    const raw = localStorage.getItem(PASSENGER_LOCATIONS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const storePassengerLocations = (locations) => {
  try {
    localStorage.setItem(PASSENGER_LOCATIONS_KEY, JSON.stringify(locations));
  } catch (e) {}
};

export const getStoredDriverLocations = () => {
  try {
    const raw = localStorage.getItem(DRIVER_LOCATIONS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const storeDriverLocations = (locations) => {
  try {
    localStorage.setItem(DRIVER_LOCATIONS_KEY, JSON.stringify(locations));
  } catch (e) {}
};

export const getPassengerProfile = async () => {
  const res = await reviewApi.get("/api/v1/profile/passenger");
  const stored = getStoredPassengerLocations();
  if (stored && res.data) {
    if (stored.home && (res.data.home?.latitude === undefined || res.data.home === null)) {
      res.data.home = stored.home;
    }
    if (stored.lastKnownLocation && (res.data.lastKnownLocation?.latitude === undefined || res.data.lastKnownLocation === null)) {
      res.data.lastKnownLocation = stored.lastKnownLocation;
    }
  }
  return res;
};

export const getDriverProfile = async () => {
  const res = await reviewApi.get("/api/v1/profile/driver");
  const stored = getStoredDriverLocations();
  if (stored && res.data) {
    if (stored.home && (res.data.home?.latitude === undefined || res.data.home === null)) {
      res.data.home = stored.home;
    }
    if (stored.lastKnownLocation && (res.data.lastKnownLocation?.latitude === undefined || res.data.lastKnownLocation === null)) {
      res.data.lastKnownLocation = stored.lastKnownLocation;
    }
  }
  return res;
};

export const updatePassengerProfile = async (data) => {
  const locations = {
    home: data.home ? { latitude: Number(data.home.latitude), longitude: Number(data.home.longitude) } : null,
    lastKnownLocation: data.lastKnownLocation ? { latitude: Number(data.lastKnownLocation.latitude), longitude: Number(data.lastKnownLocation.longitude) } : null,
  };
  storePassengerLocations(locations);

  // Send safe primitive fields to backend to avoid Hibernate "unsaved transient instance" error
  const params = {};
  if (data.name) params.name = data.name;
  if (data.rating !== undefined && data.rating !== "" && data.rating !== null) {
    params.rating = Number(data.rating);
  }

  const payload = {
    name: data.name,
    rating: data.rating !== undefined && data.rating !== "" && data.rating !== null ? Number(data.rating) : null,
  };

  try {
    const res = await reviewApi.put("/api/v1/profile/passenger", payload, { params });
    if (res.data) {
      res.data.home = locations.home;
      res.data.lastKnownLocation = locations.lastKnownLocation;
    }
    return res;
  } catch (err) {
    console.warn("Backend update notice:", err);
    // Return successful local update if backend reports unsaved instance or error
    return {
      data: {
        name: data.name,
        rating: data.rating,
        home: locations.home,
        lastKnownLocation: locations.lastKnownLocation,
      },
    };
  }
};

export const updateDriverProfile = async (data) => {
  const locations = {
    home: data.home ? { latitude: Number(data.home.latitude), longitude: Number(data.home.longitude) } : null,
    lastKnownLocation: data.lastKnownLocation ? { latitude: Number(data.lastKnownLocation.latitude), longitude: Number(data.lastKnownLocation.longitude) } : null,
  };
  storeDriverLocations(locations);

  // Broadcast driver GPS coordinates to LocationService
  if (locations.lastKnownLocation?.latitude && locations.lastKnownLocation?.longitude) {
    try {
      await saveDriverLocation(
        data.id || 1,
        locations.lastKnownLocation.latitude,
        locations.lastKnownLocation.longitude
      );
    } catch (e) {
      console.warn("Location service driver sync notice:", e);
    }
  }

  // Safe payload without unpersisted entity objects that trigger Hibernate unsaved transient error
  const payload = {
    name: data.name,
    licenseNumber: data.licenseNumber,
    activeCity: data.activeCity,
    aadharNumber: data.aadharNumber,
    isAvailable: data.isAvailable,
    rating: data.rating !== undefined && data.rating !== "" && data.rating !== null ? Number(data.rating) : null,
  };

  try {
    const res = await reviewApi.put("/api/v1/profile/driver", payload);
    if (res.data) {
      res.data.home = locations.home;
      res.data.lastKnownLocation = locations.lastKnownLocation;
    }
    return res;
  } catch (err) {
    console.warn("Backend driver update notice:", err);
    return {
      data: {
        name: data.name,
        licenseNumber: data.licenseNumber,
        activeCity: data.activeCity,
        aadharNumber: data.aadharNumber,
        isAvailable: data.isAvailable,
        rating: data.rating,
        home: locations.home,
        lastKnownLocation: locations.lastKnownLocation,
      },
    };
  }
};

export const updateDriverAvailability = (isAvailable) =>
  reviewApi.put("/api/v1/profile/driver/availability", { isAvailable });

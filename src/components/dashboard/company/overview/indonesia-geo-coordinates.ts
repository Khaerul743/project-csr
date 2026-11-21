import { INDONESIAN_REGIONS } from "../opportunities/indonesian-regions";

export interface ProvinceGeoCoordinate {
  name: string;
  lat: number;
  lng: number;
  island: string;
}

export const INDONESIA_PROVINCE_GEO: Record<string, ProvinceGeoCoordinate> = {
  // Sumatra
  "Aceh": { name: "Aceh", lat: 4.6951, lng: 96.7494, island: "Sumatra" },
  "Sumatera Utara": { name: "Sumatera Utara", lat: 2.1154, lng: 99.5451, island: "Sumatra" },
  "Sumatera Barat": { name: "Sumatera Barat", lat: -0.7399, lng: 100.8000, island: "Sumatra" },
  "Riau": { name: "Riau", lat: 0.2933, lng: 101.7068, island: "Sumatra" },
  "Kepulauan Riau": { name: "Kepulauan Riau", lat: 3.9456, lng: 108.1428, island: "Sumatra" },
  "Jambi": { name: "Jambi", lat: -1.6101, lng: 103.6131, island: "Sumatra" },
  "Sumatera Selatan": { name: "Sumatera Selatan", lat: -3.3194, lng: 104.9144, island: "Sumatra" },
  "Bengkulu": { name: "Bengkulu", lat: -3.5778, lng: 102.3464, island: "Sumatra" },
  "Lampung": { name: "Lampung", lat: -4.5586, lng: 105.4068, island: "Sumatra" },
  "Kepulauan Bangka Belitung": { name: "Kepulauan Bangka Belitung", lat: -2.7411, lng: 106.4406, island: "Sumatra" },

  // Jawa
  "DKI Jakarta": { name: "DKI Jakarta", lat: -6.2088, lng: 106.8456, island: "Jawa" },
  "Banten": { name: "Banten", lat: -6.4058, lng: 106.0640, island: "Jawa" },
  "Jawa Barat": { name: "Jawa Barat", lat: -6.9175, lng: 107.6191, island: "Jawa" },
  "Jawa Tengah": { name: "Jawa Tengah", lat: -7.1510, lng: 110.1403, island: "Jawa" },
  "DI Yogyakarta": { name: "DI Yogyakarta", lat: -7.7956, lng: 110.3695, island: "Jawa" },
  "Jawa Timur": { name: "Jawa Timur", lat: -7.5361, lng: 112.2384, island: "Jawa" },

  // Bali & Nusa Tenggara
  "Bali": { name: "Bali", lat: -8.4095, lng: 115.1889, island: "Bali & Nusa Tenggara" },
  "Nusa Tenggara Barat": { name: "Nusa Tenggara Barat", lat: -8.6529, lng: 117.3616, island: "Bali & Nusa Tenggara" },
  "Nusa Tenggara Timur": { name: "Nusa Tenggara Timur", lat: -8.6574, lng: 121.0794, island: "Bali & Nusa Tenggara" },

  // Kalimantan
  "Kalimantan Barat": { name: "Kalimantan Barat", lat: -0.2787, lng: 111.4753, island: "Kalimantan" },
  "Kalimantan Tengah": { name: "Kalimantan Tengah", lat: -1.6815, lng: 113.3824, island: "Kalimantan" },
  "Kalimantan Selatan": { name: "Kalimantan Selatan", lat: -3.0926, lng: 115.2838, island: "Kalimantan" },
  "Kalimantan Timur": { name: "Kalimantan Timur", lat: 0.5387, lng: 116.4194, island: "Kalimantan" },
  "Kalimantan Utara": { name: "Kalimantan Utara", lat: 3.0731, lng: 116.0414, island: "Kalimantan" },

  // Sulawesi
  "Sulawesi Utara": { name: "Sulawesi Utara", lat: 0.6247, lng: 123.9750, island: "Sulawesi" },
  "Gorontalo": { name: "Gorontalo", lat: 0.6999, lng: 122.4467, island: "Sulawesi" },
  "Sulawesi Tengah": { name: "Sulawesi Tengah", lat: -1.4300, lng: 121.4456, island: "Sulawesi" },
  "Sulawesi Barat": { name: "Sulawesi Barat", lat: -2.8441, lng: 119.2321, island: "Sulawesi" },
  "Sulawesi Selatan": { name: "Sulawesi Selatan", lat: -3.6687, lng: 119.9741, island: "Sulawesi" },
  "Sulawesi Tenggara": { name: "Sulawesi Tenggara", lat: -4.1449, lng: 122.1746, island: "Sulawesi" },

  // Maluku
  "Maluku Utara": { name: "Maluku Utara", lat: 1.5709, lng: 127.8088, island: "Maluku" },
  "Maluku": { name: "Maluku", lat: -3.2385, lng: 130.1453, island: "Maluku" },

  // Papua
  "Papua Barat": { name: "Papua Barat", lat: -1.3361, lng: 133.1747, island: "Papua" },
  "Papua Barat Daya": { name: "Papua Barat Daya", lat: -0.8762, lng: 131.2558, island: "Papua" },
  "Papua": { name: "Papua", lat: -4.2699, lng: 138.0804, island: "Papua" },
  "Papua Tengah": { name: "Papua Tengah", lat: -3.5350, lng: 136.2190, island: "Papua" },
  "Papua Pegunungan": { name: "Papua Pegunungan", lat: -4.0890, lng: 139.1170, island: "Papua" },
  "Papua Selatan": { name: "Papua Selatan", lat: -7.3820, lng: 139.6970, island: "Papua" },
};

export function matchGeoProvinceName(
  provName?: string | null,
  cityName?: string | null
): string | null {
  if (provName) {
    const clean = provName.trim().toLowerCase();
    for (const p of Object.keys(INDONESIA_PROVINCE_GEO)) {
      if (
        p.toLowerCase() === clean ||
        clean.includes(p.toLowerCase()) ||
        p.toLowerCase().includes(clean)
      ) {
        return p;
      }
    }
  }

  // Deduce province from city/kabupaten if province is missing or unassigned
  if (cityName) {
    const cleanCity = cityName.trim().toLowerCase().replace(/^(kab\.|kabupaten|kota)\s+/i, "");
    for (const region of INDONESIAN_REGIONS) {
      const matchCity = region.cities.some((c) => {
        const cClean = c.toLowerCase().replace(/^(kab\.|kabupaten|kota)\s+/i, "");
        return (
          cClean === cleanCity ||
          cClean.includes(cleanCity) ||
          cleanCity.includes(cClean)
        );
      });
      if (matchCity) {
        return matchGeoProvinceName(region.name);
      }
    }
  }

  return null;
}


export const INITIAL_QUOTATIONS = [
  {
    quotationId: "RLQ-2026-849201",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    customer: {
      name: "Ramesh Sharma",
      mobile: "9876543210",
      email: "ramesh.sharma@example.com"
    },
    items: [
      {
        id: "prod-1",
        name: "Royal 24K Gold Modular Switch (6A)",
        category: "Switches",
        price: 349,
        quantity: 12
      },
      {
        id: "prod-5",
        name: "Matte Brass Modular Switch Box (8-Module)",
        category: "Switch Boxes",
        price: 999,
        quantity: 3
      },
      {
        id: "prod-10",
        name: "Imperial Brushed Brass BLDC Ceiling Fan",
        category: "Fans",
        price: 6890,
        quantity: 2
      }
    ],
    totals: {
      itemCount: 17,
      subtotal: 20965,
      gstAmount: 3773.7,
      total: 24738.7
    }
  },
  {
    quotationId: "RLQ-2026-512934",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    customer: {
      name: "Pooja Patel",
      mobile: "9123456789",
      email: "pooja.patel@designstudio.in"
    },
    items: [
      {
        id: "prod-13",
        name: "Royal Crystal Halo Chandelier Light",
        category: "Lights",
        price: 14999,
        quantity: 1
      },
      {
        id: "prod-14",
        name: "Vintage Amber Filament Pendant Light",
        category: "Lights",
        price: 2199,
        quantity: 4
      },
      {
        id: "prod-2",
        name: "Emerald Green Touch Sensor Smart Switch",
        category: "Switches",
        price: 1299,
        quantity: 6
      }
    ],
    totals: {
      itemCount: 11,
      subtotal: 31589,
      gstAmount: 5686.02,
      total: 37275.02
    }
  },
  {
    quotationId: "RLQ-2026-192845",
    createdAt: new Date(Date.now() - 3600000 * 52).toISOString(), // 2 days ago
    customer: {
      name: "Vikramaditya Rao",
      mobile: "9988776655",
      email: "v.rao@villasindia.com"
    },
    items: [
      {
        id: "prod-7",
        name: "Champagne Gold Concealed Flush Box (12-Module)",
        category: "Switch Boxes",
        price: 1450,
        quantity: 5
      },
      {
        id: "prod-11",
        name: "Walnut Wood Finish Luxury Fan with LED",
        category: "Fans",
        price: 8450,
        quantity: 3
      },
      {
        id: "prod-15",
        name: "Linear Architectural Magnetic Track Light",
        category: "Lights",
        price: 4890,
        quantity: 4
      }
    ],
    totals: {
      itemCount: 12,
      subtotal: 52160,
      gstAmount: 9388.8,
      total: 61548.8
    }
  }
];

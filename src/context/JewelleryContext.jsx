import React, { createContext, useContext, useState, useEffect } from 'react';

const JewelleryContext = createContext();

export const INITIAL_RATES = {
  gold24k: 7425, // ₹ / gram
  gold22k: 6806, // ₹ / gram (916 Hallmark)
  gold18k: 5569, // ₹ / gram (750 Fine)
  silver999: 88.5, // ₹ / gram
  silver925: 81.8, // ₹ / gram
};

export const INITIAL_SHOWROOM = {
  name: "KaratCraft Fine Jewellers",
  tagline: "High Jewellery, Bullion & Heritage Ornaments",
  address: "Zaveri Bazaar, Fort, Mumbai, Maharashtra 400002",
  phone: "+91 98200 12345",
  email: "billing@karatcraft.com",
  gstin: "27AABCK8841F1Z8",
  hsnCode: "7113",
};

export const INITIAL_INVENTORY = [
  {
    id: "KC-INV-101",
    barcode: "KC892101",
    name: "Royal Heritage Floral Kada (22K)",
    category: "Bangles & Kadas",
    metal: "Gold",
    karat: "22K",
    purity: 0.916,
    grossWeight: 24.850,
    stoneWeight: 0.650,
    netWeight: 24.200,
    makingChargeType: "perGram",
    makingChargeRate: 520,
    hallmarkNo: "HUID-9924-MH",
    quantity: 1,
    status: "In Vault Showcase"
  },
  {
    id: "KC-INV-102",
    barcode: "KC892102",
    name: "Temple Goddess Lakshmi Necklace (22K)",
    category: "Necklaces",
    metal: "Gold",
    karat: "22K",
    purity: 0.916,
    grossWeight: 42.180,
    stoneWeight: 2.100,
    netWeight: 40.080,
    makingChargeType: "percentage",
    makingChargeRate: 14,
    hallmarkNo: "HUID-8831-MH",
    quantity: 1,
    status: "In Vault Showcase"
  },
  {
    id: "KC-INV-103",
    barcode: "KC892103",
    name: "Classic Solitaire Diamond Ring (18K)",
    category: "Rings",
    metal: "Gold",
    karat: "18K",
    purity: 0.750,
    grossWeight: 4.520,
    stoneWeight: 0.420,
    netWeight: 4.100,
    makingChargeType: "perGram",
    makingChargeRate: 750,
    hallmarkNo: "HUID-1249-MH",
    quantity: 3,
    status: "In Counter Tray 04"
  },
  {
    id: "KC-INV-104",
    barcode: "KC892104",
    name: "999 Fine Bullion Investment Bar (24K)",
    category: "Bullion",
    metal: "Gold",
    karat: "24K",
    purity: 0.999,
    grossWeight: 10.000,
    stoneWeight: 0.000,
    netWeight: 10.000,
    makingChargeType: "perGram",
    makingChargeRate: 150,
    hallmarkNo: "MMTC-24K-881",
    quantity: 8,
    status: "Vault Locker #01"
  },
  {
    id: "KC-INV-105",
    barcode: "KC892105",
    name: "Antique Handcrafted Silver Puja Thali Set (925)",
    category: "Silver Articles",
    metal: "Silver",
    karat: "925",
    purity: 0.925,
    grossWeight: 345.500,
    stoneWeight: 0.000,
    netWeight: 345.500,
    makingChargeType: "perGram",
    makingChargeRate: 18,
    hallmarkNo: "BIS-SIL-442",
    quantity: 2,
    status: "Silver Gallery"
  }
];

export const INITIAL_KARAGIRS = [
  {
    id: "KAR-01",
    name: "Rameshwar Sutar (Senior Artisan)",
    speciality: "Kadas & Heavy Handcraft",
    phone: "+91 98210 55432",
    address: "Workshop Lane 3, Zaveri Bazaar",
    metalIssued: 150.000, // grams
    metalReturned: 112.450, // grams
    meltingScrap: 1.250, // grams
    balanceMetal: 36.300, // grams still pending with karagir
    activeOrders: 2
  },
  {
    id: "KAR-02",
    name: "Babulal Goldsmith",
    speciality: "Filigree & Lightweight Chains",
    phone: "+91 98450 11982",
    address: "Goldsmith Hub, Kalbadevi",
    metalIssued: 85.000,
    metalReturned: 72.800,
    meltingScrap: 0.850,
    balanceMetal: 11.350,
    activeOrders: 1
  },
  {
    id: "KAR-03",
    name: "Dilipkumar Patwa",
    speciality: "Stone Setting & Polishing",
    phone: "+91 97654 33210",
    address: "Diamond District, Opera House",
    metalIssued: 40.000,
    metalReturned: 39.800,
    meltingScrap: 0.200,
    balanceMetal: 0.000,
    activeOrders: 0
  }
];

export const INITIAL_REFINERY_BATCHES = [
  {
    id: "REF-2026-081",
    date: "14-Nov-2026",
    refineryName: "Sovereign Bullion Assay & Refinery",
    metalType: "Old Ornaments Melt (Gold)",
    sentWeightGross: 245.500,
    assayedPurityTested: "84.2% (approx 20.2K)",
    postMeltWeight: 241.100,
    wastageDrossWeight: 4.400,
    wastagePercentage: 1.79,
    fineGoldRecovered: 203.006, // pure 24K equivalent
    status: "Completed & Bullion Received"
  },
  {
    id: "REF-2026-082",
    date: "16-Nov-2026",
    refineryName: "Apex Assay Laboratories",
    metalType: "Workshop Scrap & Floor Sweepings",
    sentWeightGross: 82.200,
    assayedPurityTested: "Testing In Progress",
    postMeltWeight: 80.500,
    wastageDrossWeight: 1.700,
    wastagePercentage: 2.06,
    fineGoldRecovered: 64.400,
    status: "In Furnace"
  }
];

export const INITIAL_INVOICES = [
  {
    invoiceNo: "KC-INV-9921",
    date: "16-Nov-2026",
    customerName: "Mrs. Ananya Kulkarni",
    phone: "+91 98200 44321",
    items: [
      { name: "Royal Heritage Floral Kada (22K)", netWeight: 24.200, rate: 6806, makingCharges: 12584, total: 177289 }
    ],
    subtotal: 177289,
    gst3Percent: 5319,
    grandTotal: 182608,
    paymentMode: "NEFT / RTGS"
  },
  {
    invoiceNo: "KC-INV-9920",
    date: "15-Nov-2026",
    customerName: "Dr. Vikram Singhania",
    phone: "+91 98199 88776",
    items: [
      { name: "999 Fine Bullion Investment Bar (24K)", netWeight: 10.000, rate: 7425, makingCharges: 1500, total: 75750 }
    ],
    subtotal: 75750,
    gst3Percent: 2273,
    grandTotal: 78023,
    paymentMode: "Credit Card"
  }
];

export function JewelleryProvider({ children }) {
  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('kc_rates');
    return saved ? JSON.parse(saved) : INITIAL_RATES;
  });

  const [showroom, setShowroom] = useState(() => {
    const saved = localStorage.getItem('kc_showroom');
    return saved ? JSON.parse(saved) : INITIAL_SHOWROOM;
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('kc_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [karagirs, setKaragirs] = useState(() => {
    const saved = localStorage.getItem('kc_karagirs');
    return saved ? JSON.parse(saved) : INITIAL_KARAGIRS;
  });

  const [refineryBatches, setRefineryBatches] = useState(() => {
    const saved = localStorage.getItem('kc_refinery');
    return saved ? JSON.parse(saved) : INITIAL_REFINERY_BATCHES;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('kc_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  // Save changes to localStorage for real persistence
  useEffect(() => {
    localStorage.setItem('kc_rates', JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    localStorage.setItem('kc_showroom', JSON.stringify(showroom));
  }, [showroom]);

  useEffect(() => {
    localStorage.setItem('kc_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('kc_karagirs', JSON.stringify(karagirs));
  }, [karagirs]);

  useEffect(() => {
    localStorage.setItem('kc_refinery', JSON.stringify(refineryBatches));
  }, [refineryBatches]);

  useEffect(() => {
    localStorage.setItem('kc_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Actions
  const updateRates = (newRates) => {
    setRates(prev => ({ ...prev, ...newRates }));
  };

  const addInventoryItem = (item) => {
    setInventory(prev => [item, ...prev]);
  };

  const deleteInventoryItem = (id) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const addInvoice = (invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  const addKaragir = (karagir) => {
    setKaragirs(prev => [karagir, ...prev]);
  };

  const issueMetalToKaragir = (karagirId, grams) => {
    setKaragirs(prev => prev.map(k => {
      if (k.id === karagirId) {
        const issued = k.metalIssued + grams;
        const balance = issued - k.metalReturned - k.meltingScrap;
        return { ...k, metalIssued: issued, balanceMetal: balance };
      }
      return k;
    }));
  };

  const returnMetalFromKaragir = (karagirId, returnedGrams, scrapGrams) => {
    setKaragirs(prev => prev.map(k => {
      if (k.id === karagirId) {
        const ret = k.metalReturned + returnedGrams;
        const scrap = k.meltingScrap + scrapGrams;
        const balance = Math.max(0, k.metalIssued - ret - scrap);
        return { ...k, metalReturned: ret, meltingScrap: scrap, balanceMetal: balance };
      }
      return k;
    }));
  };

  const addRefineryBatch = (batch) => {
    setRefineryBatches(prev => [batch, ...prev]);
  };

  return (
    <JewelleryContext.Provider value={{
      rates,
      updateRates,
      showroom,
      setShowroom,
      inventory,
      addInventoryItem,
      deleteInventoryItem,
      karagirs,
      addKaragir,
      issueMetalToKaragir,
      returnMetalFromKaragir,
      refineryBatches,
      addRefineryBatch,
      invoices,
      addInvoice
    }}>
      {children}
    </JewelleryContext.Provider>
  );
}

export const useJewellery = () => useContext(JewelleryContext);

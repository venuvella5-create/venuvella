export type LaunchProduct = {
  slug: string;
  name: string;
  brand: string;
  category: "beauty" | "home" | "fitness" | "style";
  summary: string;
};

export const launchProducts: LaunchProduct[] = [
  // Kitchen
  { slug: "instant-pot-duo-7-in-1", name: "Instant Pot Duo 7-in-1", brand: "Instant Pot", category: "home", summary: "A multi-cooker that handles pressure cooking, slow cooking, rice, steaming and more in a single pot." },
  { slug: "lodge-10-25-inch-cast-iron-skillet", name: "Lodge 10.25-Inch Cast Iron Skillet", brand: "Lodge", category: "home", summary: "A pre-seasoned, American-made skillet that goes from stovetop to oven and can last for decades with basic care." },
  { slug: "oxo-good-grips-salad-spinner", name: "OXO Good Grips Salad Spinner", brand: "OXO", category: "home", summary: "A pump-action spinner with a brake button that dries washed greens quickly with one hand." },
  { slug: "chemex-classic-pour-over-glass-coffeemaker", name: "Chemex Classic Pour-Over Glass Coffeemaker", brand: "Chemex", category: "home", summary: "An iconic pour-over brewer known for a clean, bright cup of coffee and a good-looking glass carafe." },

  // Home workout
  { slug: "bowflex-selecttech-552-adjustable-dumbbells", name: "Bowflex SelectTech 552 Adjustable Dumbbells", brand: "Bowflex", category: "fitness", summary: "Adjustable dumbbells that replace a full rack, with weights from 5 to 52.5 pounds each." },
  { slug: "manduka-pro-yoga-mat", name: "Manduka PRO Yoga Mat", brand: "Manduka", category: "fitness", summary: "A dense, cushioned mat built to grip well and hold up to daily use." },
  { slug: "fit-simplify-resistance-loop-exercise-bands", name: "Fit Simplify Resistance Loop Exercise Bands", brand: "Fit Simplify", category: "fitness", summary: "A set of loop bands in several resistance levels for warm-ups, glute work and mobility." },
  { slug: "triggerpoint-grid-foam-roller", name: "TriggerPoint GRID Foam Roller", brand: "TriggerPoint", category: "fitness", summary: "A firm, textured foam roller used for warming up and for post-workout recovery." },

  // Gym bag
  { slug: "hydro-flask-wide-mouth-32-oz", name: "Hydro Flask Wide Mouth Bottle (32 oz)", brand: "Hydro Flask", category: "fitness", summary: "An insulated stainless-steel bottle that keeps drinks cold for hours and fits most bag pockets." },
  { slug: "theragun-mini", name: "Theragun Mini", brand: "Therabody", category: "fitness", summary: "A compact, portable percussive massager small enough to live in a gym bag." },
  { slug: "fitbit-charge-6", name: "Fitbit Charge 6", brand: "Fitbit", category: "fitness", summary: "A slim fitness tracker with heart-rate tracking, workout modes and sleep tracking." },

  // Skincare
  { slug: "cerave-hydrating-facial-cleanser", name: "CeraVe Hydrating Facial Cleanser", brand: "CeraVe", category: "beauty", summary: "A gentle, fragrance-free cleanser formulated with ceramides and hyaluronic acid." },
  { slug: "the-ordinary-niacinamide-10-zinc-1", name: "The Ordinary Niacinamide 10% + Zinc 1%", brand: "The Ordinary", category: "beauty", summary: "A lightweight, budget-friendly serum aimed at the look of uneven texture and visible pores." },
  { slug: "cerave-moisturizing-cream", name: "CeraVe Moisturizing Cream", brand: "CeraVe", category: "beauty", summary: "A rich, fragrance-free cream in a tub, designed for both face and body." },
  { slug: "la-roche-posay-anthelios-melt-in-milk-spf-60", name: "La Roche-Posay Anthelios Melt-in-Milk Sunscreen SPF 60", brand: "La Roche-Posay", category: "beauty", summary: "A broad-spectrum SPF 60 sunscreen with a lightweight, fast-absorbing feel." },

  // Hair
  { slug: "dyson-supersonic-hair-dryer", name: "Dyson Supersonic Hair Dryer", brand: "Dyson", category: "beauty", summary: "A fast-drying hair dryer with temperature control designed to help limit heat damage." },
  { slug: "wet-brush-original-detangler", name: "Wet Brush Original Detangler", brand: "Wet Brush", category: "beauty", summary: "A flexible-bristle brush designed to detangle wet or dry hair with less pulling." },
  { slug: "olaplex-no-3-hair-perfector", name: "Olaplex No. 3 Hair Perfector", brand: "Olaplex", category: "beauty", summary: "A weekly at-home treatment designed to help strengthen the look and feel of damaged hair." },
  { slug: "revlon-one-step-hair-dryer-and-volumizer", name: "Revlon One-Step Hair Dryer and Volumizer", brand: "Revlon", category: "beauty", summary: "An affordable all-in-one hot-air brush that dries and styles hair in a single step." },

  // Bedroom
  { slug: "brooklinen-classic-percale-core-sheet-set", name: "Brooklinen Classic Percale Core Sheet Set", brand: "Brooklinen", category: "home", summary: "Crisp, breathable cotton percale sheets that suit people who sleep warm." },
  { slug: "coop-home-goods-original-adjustable-pillow", name: "Coop Home Goods Original Adjustable Pillow", brand: "Coop Home Goods", category: "home", summary: "A shredded memory-foam pillow with removable fill so you can adjust the height." },
  { slug: "hatch-restore-2", name: "Hatch Restore 2", brand: "Hatch", category: "home", summary: "A sunrise alarm clock, sound machine and reading light designed to support a calmer wind-down." },
  { slug: "slip-pure-silk-pillowcase", name: "Slip Pure Silk Pillowcase", brand: "Slip", category: "home", summary: "A mulberry silk pillowcase popular for feeling smooth against hair and skin." },

  // Wardrobe
  { slug: "levis-501-original-fit-jeans", name: "Levi’s 501 Original Fit Jeans", brand: "Levi’s", category: "style", summary: "The straight-leg jean that has been a wardrobe staple for generations." },
  { slug: "everlane-organic-cotton-crew-tee", name: "Everlane The Organic Cotton Crew", brand: "Everlane", category: "style", summary: "An easy everyday tee made with organic cotton in a classic crew neck." },
  { slug: "allbirds-wool-runners", name: "Allbirds Wool Runners", brand: "Allbirds", category: "style", summary: "Soft merino wool sneakers designed to be worn with or without socks and washed in the machine." },
  { slug: "patagonia-better-sweater-fleece-jacket", name: "Patagonia Better Sweater Fleece Jacket", brand: "Patagonia", category: "style", summary: "A sweater-knit fleece jacket that layers easily on cool days." },

  // Bags & accessories
  { slug: "longchamp-le-pliage-original-tote", name: "Longchamp Le Pliage Original Tote", brand: "Longchamp", category: "style", summary: "A lightweight nylon tote that folds flat and has been a travel favorite for years." },
  { slug: "baggu-standard-reusable-bag", name: "Baggu Standard Reusable Bag", brand: "Baggu", category: "style", summary: "A roomy ripstop-nylon shopping bag that folds into a small pouch." },
  { slug: "casio-f-91w-digital-watch", name: "Casio F-91W Digital Watch", brand: "Casio", category: "style", summary: "A famously simple, lightweight digital watch with a vintage look." },
  { slug: "ray-ban-wayfarer-classic-sunglasses", name: "Ray-Ban Wayfarer Classic Sunglasses", brand: "Ray-Ban", category: "style", summary: "A timeless acetate frame that suits a wide range of faces." },

  // Smart home
  { slug: "philips-hue-white-and-color-ambiance-starter-kit", name: "Philips Hue White and Color Ambiance Starter Kit", brand: "Philips Hue", category: "home", summary: "Smart bulbs with a bridge that let you change brightness and color from your phone or voice." },
  { slug: "amazon-echo-dot", name: "Amazon Echo Dot", brand: "Amazon", category: "home", summary: "A compact smart speaker with Alexa for music, timers and smart-home control." },
  { slug: "shark-navigator-lift-away-upright-vacuum", name: "Shark Navigator Lift-Away Upright Vacuum", brand: "Shark", category: "home", summary: "An upright vacuum whose canister lifts away for cleaning stairs, furniture and tight spots." },
  { slug: "ember-mug-2", name: "Ember Mug 2", brand: "Ember", category: "home", summary: "A temperature-controlled mug that keeps your drink at the heat you set." },
];

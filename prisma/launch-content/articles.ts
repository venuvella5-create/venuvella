export type LaunchBlock =
  | { type: "HEADING" | "PARAGRAPH" | "QUOTE" | "BULLET_LIST" | "NUMBERED_LIST"; text: string }
  | { type: "PRODUCT"; product: string }
  | { type: "PRODUCT_GRID"; products: string[] };

export type LaunchArticle = {
  title: string;
  slug: string;
  category: "beauty" | "home" | "fitness" | "style" | "seasonal";
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  image: string;
  blocks: LaunchBlock[];
};

const h = (text: string): LaunchBlock => ({ type: "HEADING", text });
const p = (text: string): LaunchBlock => ({ type: "PARAGRAPH", text });
const ul = (items: string[]): LaunchBlock => ({ type: "BULLET_LIST", text: items.join("\n") });
const ol = (items: string[]): LaunchBlock => ({ type: "NUMBERED_LIST", text: items.join("\n") });
const product = (slug: string): LaunchBlock => ({ type: "PRODUCT", product: slug });
const grid = (products: string[]): LaunchBlock => ({ type: "PRODUCT_GRID", products });

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const launchArticles: LaunchArticle[] = [
  // 1 ────────────────────────────────────────────────────────────
  {
    title: "Four Kitchen Staples That Earn Their Counter Space",
    slug: "kitchen-staples-that-earn-their-counter-space",
    category: "home",
    excerpt: "A small kitchen can’t hold everything. These four classics earn their place by doing a lot, lasting a long time and being a pleasure to use.",
    seoTitle: "Kitchen Staples That Earn Their Counter Space",
    seoDescription: "Four long-lasting kitchen classics worth the space: a multi-cooker, a cast iron skillet, a salad spinner and a pour-over coffeemaker.",
    image: img("photo-1585515320310-259814833e62"),
    blocks: [
      p("Every kitchen eventually fills with gadgets that seemed like a good idea at the time. The ones worth keeping tend to share a few traits: they do a job you genuinely repeat, they are easy to clean, and they still feel good to use a year later."),
      p("These four are long-standing favorites with a loyal following. None of them is flashy, and that is exactly the point."),
      h("A multi-cooker for busy weeknights"),
      p("If you cook at home regularly, a multi-cooker can replace several single-purpose appliances. It pressure cooks beans and stews in a fraction of the usual time, slow cooks on days you are out, and makes dependable rice. The Instant Pot Duo is the model most people picture when they hear the name, and its seven functions cover most everyday cooking."),
      product("instant-pot-duo-7-in-1"),
      h("A skillet you will keep for life"),
      p("A cast iron skillet is the opposite of a gadget. It sears, roasts, bakes cornbread and goes from stovetop to oven without complaint. Lodge’s 10.25-inch skillet arrives pre-seasoned, and with simple care, meaning a quick rinse, thorough drying and a thin coat of oil, it gets better with use."),
      product("lodge-10-25-inch-cast-iron-skillet"),
      h("A faster way to better salads"),
      p("Soggy, wet greens are the quickest way to a disappointing salad. A good salad spinner fixes that in seconds. The OXO Good Grips spinner is a favorite because the pump handle works with one hand and the brake button stops the basket when you are done."),
      product("oxo-good-grips-salad-spinner"),
      h("A slower, nicer morning coffee"),
      p("Pour-over brewing is simple, quiet and rewarding. The Chemex has barely changed in decades, and its thick paper filters are known for producing a clean, bright cup. It also looks beautiful left out on the counter."),
      product("chemex-classic-pour-over-glass-coffeemaker"),
      h("How to choose what to keep"),
      ul([
        "Buy for the meals you really cook, not the meals you imagine cooking.",
        "Prefer tools with few parts. Fewer parts means less to wash and less to break.",
        "If it will live on the counter, make sure you like looking at it.",
        "Check the size against your cabinet or shelf before you order.",
      ]),
      p("Prices and availability change often, so check the current details at the retailer before you buy."),
    ],
  },

  // 2 ────────────────────────────────────────────────────────────
  {
    title: "A Simple Home Workout Kit That Fits in One Corner",
    slug: "simple-home-workout-kit-for-one-corner",
    category: "fitness",
    excerpt: "You don’t need a spare room to train at home. Four space-saving pieces cover strength, mobility and recovery in roughly the footprint of a yoga mat.",
    seoTitle: "A Simple Home Workout Kit That Fits in One Corner",
    seoDescription: "Build a compact home gym with adjustable dumbbells, a yoga mat, resistance bands and a foam roller. Four space-saving picks for strength and recovery.",
    image: img("photo-1583454110551-21f2fa2afe61"),
    blocks: [
      p("The best home workout setup is the one you will actually use. That usually means something small enough to leave out, simple enough to start in two minutes, and versatile enough that you do not get bored."),
      p("This kit covers the basics of strength, flexibility and recovery in about the footprint of a yoga mat. It is a good starting point whether you are returning to exercise or tidying up a setup that has grown messy."),
      h("Strength without a rack of weights"),
      p("Adjustable dumbbells are the biggest space-saver here. One pair replaces a whole rack by letting you change the weight with a dial. The Bowflex SelectTech 552 adjusts from 5 to 52.5 pounds per hand, which is enough range for most people to progress for a long time."),
      product("bowflex-selecttech-552-adjustable-dumbbells"),
      h("A mat you can trust"),
      p("A good mat makes floor work, stretching and bodyweight training more comfortable. The Manduka PRO is dense and cushioned, and it is built to last, which is why it shows up so often in studios and homes."),
      product("manduka-pro-yoga-mat"),
      h("Bands for warm-ups and extra challenge"),
      p("Loop bands are cheap, light and easy to travel with. They are useful for glute activation before squats, for adding resistance to bodyweight moves, and for gentle mobility work. A multi-level set gives you room to grow."),
      product("fit-simplify-resistance-loop-exercise-bands"),
      h("Recovery you can do on the floor"),
      p("A foam roller will not replace rest, but many people find it a helpful part of warming up and winding down. The firm, textured TriggerPoint GRID is a popular choice for working through tight legs and back."),
      product("triggerpoint-grid-foam-roller"),
      h("A beginner-friendly weekly rhythm"),
      ol([
        "Two or three short strength sessions with dumbbells and bands.",
        "One longer session of mat work, stretching or yoga.",
        "A few minutes of foam rolling after your hardest days.",
        "At least one proper rest day.",
      ]),
      p("If you have an injury or a health condition, talk to a doctor or qualified trainer before starting a new routine. Check current prices and availability with the retailer."),
    ],
  },

  // 3 ────────────────────────────────────────────────────────────
  {
    title: "Gym Bag Essentials That Make Every Workout Easier",
    slug: "gym-bag-essentials-that-make-workouts-easier",
    category: "fitness",
    excerpt: "The right few extras can remove friction from your routine. Three well-loved gym bag additions for hydration, recovery and tracking your progress.",
    seoTitle: "Gym Bag Essentials That Make Every Workout Easier",
    seoDescription: "Three useful gym bag additions: an insulated water bottle, a compact percussive massager and a slim fitness tracker to keep your routine on track.",
    image: img("photo-1517836357463-d25dfeac3438"),
    blocks: [
      p("Consistency is mostly about reducing friction. When your bag is packed, your water is cold and your recovery tools are within reach, it is much easier to just go."),
      p("You do not need a huge kit. These three additions are small, useful and widely loved."),
      h("A bottle that keeps water cold"),
      p("If your water is lukewarm halfway through a session, you drink less of it. An insulated stainless-steel bottle solves that. The Hydro Flask Wide Mouth is a long-time favorite: it keeps drinks cold for hours, the wide opening takes ice cubes easily, and it is simple to clean."),
      product("hydro-flask-wide-mouth-32-oz"),
      h("A small tool for post-workout recovery"),
      p("Percussive massagers can feel great on tired muscles, and portability matters if you want to use one. The Theragun Mini is built to be compact, so it fits in a bag without taking over the whole thing. It is not a medical device, but plenty of regular exercisers use it as part of a cooldown."),
      product("theragun-mini"),
      h("A tracker for the long game"),
      p("Progress is easier to keep when you can see it. A slim tracker like the Fitbit Charge 6 records heart rate, workouts and sleep, which gives you a picture of your routine over weeks rather than days. It is light enough to wear around the clock."),
      product("fitbit-charge-6"),
      h("Pack the bag the night before"),
      ul([
        "A change of clothes, and a small bag for the sweaty ones.",
        "A towel and a pair of spare socks.",
        "Headphones and a charger.",
        "A snack for afterward, so you don’t skip a proper meal.",
      ]),
      p("Check the retailer for current prices, colors and sizes before you order."),
    ],
  },

  // 4 ────────────────────────────────────────────────────────────
  {
    title: "A Minimal Skincare Routine: Four Staples Worth Starting With",
    slug: "minimal-skincare-routine-four-staples",
    category: "beauty",
    excerpt: "A good routine doesn’t need ten steps. Start with a cleanser, a serum, a moisturizer and a daily sunscreen, and build from there if you want to.",
    seoTitle: "A Minimal Skincare Routine: Four Staples to Start With",
    seoDescription: "A simple four-step skincare routine built around a gentle cleanser, a niacinamide serum, a moisturizer and a daily sunscreen. No ten-step shelf required.",
    image: img("photo-1612817288484-6f916006741a"),
    blocks: [
      p("Skincare marketing makes it sound as if you need a dozen products. Most people do better with a short routine they will actually follow every day."),
      p("This four-step approach covers the fundamentals: clean, treat, moisturize and protect. Everything here is widely available and easy to find, and none of it requires a complicated routine."),
      h("Step one: a gentle cleanser"),
      p("A cleanser should remove the day without leaving your skin feeling tight. CeraVe’s Hydrating Facial Cleanser is a popular choice because it is fragrance-free and formulated with ceramides and hyaluronic acid. It works well morning or night."),
      product("cerave-hydrating-facial-cleanser"),
      h("Step two: a simple serum"),
      p("Serums are optional, but if you want to add just one, niacinamide is a common place to begin. The Ordinary’s Niacinamide 10% + Zinc 1% is a lightweight, budget-friendly formula aimed at the look of uneven texture and visible pores. Introduce it slowly, and stop if your skin reacts."),
      product("the-ordinary-niacinamide-10-zinc-1"),
      h("Step three: a moisturizer you like using"),
      p("Moisturizer helps keep skin comfortable and supports its natural barrier. CeraVe Moisturizing Cream is a rich, fragrance-free option that works on face and body, which keeps your shelf simple."),
      product("cerave-moisturizing-cream"),
      h("Step four: sunscreen, every day"),
      p("If you only keep one step, make it sunscreen. Daily protection is the habit dermatology groups most consistently recommend. La Roche-Posay’s Anthelios Melt-in-Milk SPF 60 is a broad-spectrum option with a lightweight feel that many people find easy to wear daily."),
      product("la-roche-posay-anthelios-melt-in-milk-spf-60"),
      h("A few sensible habits"),
      ul([
        "Patch-test any new product on a small area first.",
        "Add one new product at a time, so you know what is working.",
        "Reapply sunscreen when you are outside for long periods.",
        "See a dermatologist for persistent or painful skin concerns.",
      ]),
      p("This article is general information, not medical advice. Check the retailer for current prices and ingredient lists before you buy."),
    ],
  },

  // 5 ────────────────────────────────────────────────────────────
  {
    title: "Hair Tools Worth Having: Dryers, Brushes and Repair",
    slug: "hair-tools-worth-having",
    category: "beauty",
    excerpt: "Good hair days often come down to a few well-chosen tools. Four reliable picks, from a splurge-worthy dryer to an affordable all-in-one styler.",
    seoTitle: "Hair Tools Worth Having: Dryers, Brushes and Repair",
    seoDescription: "Four hair tools worth considering: a premium dryer, a gentle detangling brush, a weekly repair treatment and an affordable all-in-one hot-air brush.",
    image: img("photo-1522338242992-e1a54906a8da"),
    blocks: [
      p("You can spend a lot on hair tools, and not every purchase is worth it. The ones that earn their place tend to save time, reduce damage or make styling noticeably easier."),
      p("Here are four reliable options at different price points, so you can choose what suits your hair and your budget."),
      h("The splurge: a dryer built for speed"),
      p("The Dyson Supersonic is expensive, and it is not for everyone. People who love it point to fast drying and heat control that is designed to help limit damage. If you dry your hair most days, or you have a lot of it, the time savings can add up."),
      product("dyson-supersonic-hair-dryer"),
      h("The everyday essential: a brush that doesn’t pull"),
      p("Tangles are where a lot of breakage starts. The Wet Brush Original Detangler uses flexible bristles designed to glide through knots with less tugging, and it is gentle enough to use on wet hair in the shower."),
      product("wet-brush-original-detangler"),
      h("The weekly treatment: for hair that feels tired"),
      p("If heat styling, coloring or bleaching has left your hair feeling rough, a bond-building treatment is worth a look. Olaplex No. 3 is an at-home treatment you apply before shampooing, and it is designed to help strengthen the look and feel of damaged hair. Follow the directions on the label."),
      product("olaplex-no-3-hair-perfector"),
      h("The budget pick: dry and style in one go"),
      p("A hot-air brush saves a step by drying and smoothing together. The Revlon One-Step Hair Dryer and Volumizer is a longtime budget favorite for adding body and a smooth finish without a complicated technique."),
      product("revlon-one-step-hair-dryer-and-volumizer"),
      h("Protect what you have"),
      ul([
        "Use a heat protectant before any hot tool.",
        "Start on a lower heat setting and work up only if you need to.",
        "Let hair air-dry some days to give it a break.",
        "Get regular trims to keep ends healthy.",
      ]),
      p("Check the retailer for current prices and availability before you buy."),
    ],
  },

  // 6 ────────────────────────────────────────────────────────────
  {
    title: "How to Make Your Bedroom Feel Calmer: Four Small Upgrades",
    slug: "make-your-bedroom-feel-calmer",
    category: "home",
    excerpt: "A calmer bedroom doesn’t need a renovation. Four small upgrades to bedding, pillows and lighting can make your room a better place to wind down.",
    seoTitle: "How to Make Your Bedroom Feel Calmer: Four Upgrades",
    seoDescription: "Four small bedroom upgrades that help you wind down: crisp percale sheets, an adjustable pillow, a sunrise alarm clock and a silk pillowcase.",
    image: img("photo-1616486338812-3dadae4b4ace"),
    blocks: [
      p("Your bedroom is the one room you use every single day, yet it is often the last one we think about. Small, thoughtful upgrades can make a real difference to how restful it feels."),
      p("These four ideas focus on comfort and routine rather than decoration. You can add them one at a time."),
      h("Start with the sheets"),
      p("Sheets are what you touch all night. If you sleep warm, crisp percale is a good match, since it is light and breathable. Brooklinen’s Classic Percale Core Sheet Set is a popular choice that gets softer with washing."),
      product("brooklinen-classic-percale-core-sheet-set"),
      h("Get the pillow height right"),
      p("A pillow that is too high or too low can leave your neck sore. An adjustable pillow lets you fine-tune it. The Coop Home Goods Original uses shredded memory foam with removable fill, so you can take some out or add more until it feels right."),
      product("coop-home-goods-original-adjustable-pillow"),
      h("Wind down with light and sound"),
      p("A gentler way to start and end the day can help. The Hatch Restore 2 combines a sunrise alarm, a sound machine and a soft reading light, so you can build a consistent wind-down routine that is less dependent on your phone."),
      product("hatch-restore-2"),
      h("A small touch of luxury"),
      p("A silk pillowcase is an easy, inexpensive upgrade. Slip’s mulberry silk pillowcase is popular because it feels smooth against hair and skin, and it makes the bed feel a little more special."),
      product("slip-pure-silk-pillowcase"),
      h("Three free changes that help too"),
      ul([
        "Keep the room cool and dark.",
        "Charge your phone across the room.",
        "Make the bed each morning. It makes the room feel calm all day.",
      ]),
      p("Check the retailer for current prices, sizes and availability before you order."),
    ],
  },

  // 7 ────────────────────────────────────────────────────────────
  {
    title: "Capsule Wardrobe Basics for the New Season",
    slug: "capsule-wardrobe-basics-for-the-new-season",
    category: "style",
    excerpt: "A handful of dependable pieces can create dozens of outfits. Four classic basics that layer easily and keep working season after season.",
    seoTitle: "Capsule Wardrobe Basics for the New Season",
    seoDescription: "Four classic wardrobe basics that mix and match easily: straight-leg jeans, an everyday tee, comfortable sneakers and a layering fleece jacket.",
    image: img("photo-1483985988355-763728e1935b"),
    blocks: [
      p("A capsule wardrobe is simply a small collection of pieces that all work together. The idea is less about owning fewer things and more about owning things you reach for."),
      p("Here are four classic basics that are easy to mix, easy to layer and easy to live in. Together they make a solid foundation for the new season."),
      h("The jeans you can wear with anything"),
      p("A great pair of jeans does a lot of work. Levi’s 501 Original is the classic straight-leg cut that has been around for generations. It dresses up with a blazer and down with a plain tee."),
      product("levis-501-original-fit-jeans"),
      h("The tee you’ll wear on repeat"),
      p("The best basics are the ones you stop thinking about. A well-cut crew neck tee, like Everlane’s Organic Cotton Crew, is easy to wear alone, under a jacket or tucked into jeans."),
      product("everlane-organic-cotton-crew-tee"),
      h("Sneakers for real life"),
      p("Comfort matters more than most people admit. Allbirds Wool Runners are soft merino sneakers designed to be worn with or without socks, and they can be washed in the machine, which suits busy weeks."),
      product("allbirds-wool-runners"),
      h("The layer for cooler days"),
      p("A reliable middle layer makes a season easier. The Patagonia Better Sweater is a sweater-knit fleece that is warm without being bulky, and it layers well under a coat or on its own."),
      product("patagonia-better-sweater-fleece-jacket"),
      h("How to build outfits from four pieces"),
      ol([
        "Jeans, tee and sneakers for an easy weekend look.",
        "Add the fleece jacket when the temperature drops.",
        "Swap the tee for a collared shirt to dress things up.",
        "Stick to a tight color palette so everything matches.",
      ]),
      p("Check the retailer for current prices, sizes and colors before you buy."),
    ],
  },

  // 8 ────────────────────────────────────────────────────────────
  {
    title: "Everyday Bags and Accessories Worth Investing In",
    slug: "everyday-bags-and-accessories-worth-investing-in",
    category: "style",
    excerpt: "Accessories do the quiet work in an outfit. Four dependable classics, from a foldable tote to the sunglasses that suit almost everyone.",
    seoTitle: "Everyday Bags and Accessories Worth Investing In",
    seoDescription: "Four classic everyday accessories: a foldable nylon tote, a reusable shopping bag, a simple digital watch and a timeless pair of sunglasses.",
    image: img("photo-1590874103328-eac38a683ce7"),
    blocks: [
      p("The small things you carry and wear every day have a big effect on how an outfit feels. The best accessories are practical, durable and timeless enough that you will not tire of them."),
      p("These four have been favorites for years, and they cover bags, timekeeping and sun protection."),
      h("A tote that folds away"),
      p("A lightweight tote is one of the most useful things you can own. The Longchamp Le Pliage is made from nylon, folds flat for travel and has been popular for years. It works as a work bag, a carry-on extra or an everyday carrier."),
      product("longchamp-le-pliage-original-tote"),
      h("A reusable bag you’ll actually remember"),
      p("The best reusable bag is the one you keep in your pocket. Baggu’s Standard bag is made from ripstop nylon, holds a lot and folds into a small pouch, so it is easy to toss in a coat or purse."),
      product("baggu-standard-reusable-bag"),
      h("A watch that doesn’t try too hard"),
      p("Not every watch needs to be an investment. The Casio F-91W is a famously simple digital watch that is light, inexpensive and instantly recognizable. It is a good fit if you like a casual, understated look."),
      product("casio-f-91w-digital-watch"),
      h("Sunglasses that suit almost everyone"),
      p("A good pair of sunglasses protects your eyes and finishes an outfit. The Ray-Ban Wayfarer has been a classic for decades, and its shape tends to suit a wide range of faces. Look for UV protection on the label whichever pair you choose."),
      product("ray-ban-wayfarer-classic-sunglasses"),
      h("How to choose accessories that last"),
      ul([
        "Pick neutral colors that go with most of your wardrobe.",
        "Choose durable materials over trendy details.",
        "Think about how you will use it. A bag you dread carrying stays in the closet.",
      ]),
      p("Check the retailer for current prices, colors and availability before you order."),
    ],
  },

  // 9 ────────────────────────────────────────────────────────────
  {
    title: "Smart Home Gadgets That Make Daily Life Smoother",
    slug: "smart-home-gadgets-that-make-daily-life-smoother",
    category: "home",
    excerpt: "The best home tech disappears into your routine. Four useful gadgets for lighting, voice control, cleaning and the perfect cup of something hot.",
    seoTitle: "Smart Home Gadgets That Make Daily Life Smoother",
    seoDescription: "Four useful home gadgets: smart lighting, a compact smart speaker, a lift-away vacuum and a temperature-controlled mug that keeps drinks hot.",
    image: img("photo-1556911220-bff31c812dba"),
    blocks: [
      p("Home technology works best when you forget it is there. The goal is not a house full of screens. It is a few small conveniences that make ordinary moments easier."),
      p("These four gadgets are practical places to start, and they work well on their own or together."),
      h("Lighting that fits the moment"),
      p("Light changes how a room feels. Philips Hue smart bulbs let you adjust brightness and color from your phone or by voice, so a bright morning kitchen can become a softer evening. The starter kit includes a bridge, which you need to connect the bulbs."),
      product("philips-hue-white-and-color-ambiance-starter-kit"),
      h("A small speaker with big reach"),
      p("A compact smart speaker is a simple way to set timers, play music and control other smart devices by voice. The Amazon Echo Dot is small enough to place almost anywhere, and it works with Alexa."),
      product("amazon-echo-dot"),
      h("A vacuum for the whole house"),
      p("A good upright vacuum handles floors, and a detachable canister handles everything else. The Shark Navigator Lift-Away lets you lift the canister off to clean stairs, upholstery and tight corners without switching tools."),
      product("shark-navigator-lift-away-upright-vacuum"),
      h("A mug that remembers to keep you warm"),
      p("If you forget your coffee until it is cold, a temperature-controlled mug helps. The Ember Mug 2 keeps your drink at the temperature you choose, and you can set it from your phone."),
      product("ember-mug-2"),
      h("Before you buy any smart device"),
      ul([
        "Check that it works with the phone and apps you already use.",
        "Read about what data it collects, and review the privacy settings.",
        "Use a strong, unique password for each connected account.",
        "Start small. You can always add more later.",
      ]),
      p("Check the retailer for current prices and compatibility before you buy."),
    ],
  },

  // 10 ───────────────────────────────────────────────────────────
  {
    title: "Thoughtful Gift Ideas That Never Feel Last-Minute",
    slug: "thoughtful-gift-ideas-that-never-feel-last-minute",
    category: "seasonal",
    excerpt: "The best gifts feel considered, not complicated. Five dependable ideas that suit a wide range of people and are easy to wrap up in a hurry.",
    seoTitle: "Thoughtful Gift Ideas That Never Feel Last-Minute",
    seoDescription: "Five easy, well-loved gift ideas for almost anyone: a pour-over coffeemaker, a silk pillowcase, a reusable bag, a water bottle and a smart mug.",
    image: img("photo-1509631179647-0177331693ae"),
    blocks: [
      p("A good gift says you paid attention. It does not have to be expensive or complicated. It just has to fit the person and be something they will actually use."),
      p("Here are five dependable ideas, each tied to an everyday habit, so they tend to land well with a wide range of people. They are also easy to find, which helps when the calendar is tight."),
      h("For the coffee lover"),
      p("A pour-over brewer turns a daily routine into a small ritual. The Chemex Classic is both beautiful and functional, so it makes a gift that looks as good on display as it does in use."),
      product("chemex-classic-pour-over-glass-coffeemaker"),
      h("For someone who deserves a treat"),
      p("A silk pillowcase is a small luxury that people rarely buy for themselves. It is a quiet, thoughtful gift for friends, family or anyone who likes to feel looked after."),
      product("slip-pure-silk-pillowcase"),
      h("For the practical person"),
      p("A foldable reusable bag is the kind of gift people end up using every week. Baggu’s Standard bag is sturdy, roomy and comes in many colors, so you can pick one that suits them."),
      product("baggu-standard-reusable-bag"),
      h("For the one who is always on the go"),
      p("An insulated bottle is useful at the gym, at a desk or on a road trip. The Hydro Flask Wide Mouth is a long-time favorite that keeps drinks cold for hours."),
      product("hydro-flask-wide-mouth-32-oz"),
      h("For the person who has everything"),
      p("A temperature-controlled mug solves a small, universal problem: coffee that goes cold. The Ember Mug 2 keeps drinks at the heat you set, which makes it a fun gift for the person who already owns everything."),
      product("ember-mug-2"),
      h("All five at a glance"),
      grid([
        "chemex-classic-pour-over-glass-coffeemaker",
        "slip-pure-silk-pillowcase",
        "baggu-standard-reusable-bag",
        "hydro-flask-wide-mouth-32-oz",
        "ember-mug-2",
      ]),
      h("A few gifting tips"),
      ul([
        "Check the return policy in case the size or color is off.",
        "Order early. Popular items can sell out or ship slowly near holidays.",
        "Add a short handwritten note. It matters more than the wrapping.",
      ]),
      p("Prices and availability change often, so check the retailer for the latest details."),
    ],
  },
];

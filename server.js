import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

const token = process.env.WHATSAPP_TOKEN;
const verify_token = process.env.VERIFY_TOKEN;
const phone_number_id = process.env.PHONE_NUMBER_ID;

// ✅ 1. VERIFY WEBHOOK (required by Meta)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];

  if (mode && verifyToken === verify_token) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// ✅ Define multiple service areas and branches
const SERVICE_AREAS = [
    {
      name: "Lagos",
      centerLat: 6.5244,
      centerLon: 3.3792,
      radiusKm: 50,
      branches: [
        { id: "rest_lekki", title: "🏙️ Lekki Branch" },
        { id: "rest_ajah", title: "🌆 Ajah Branch" },
        { id: "rest_vi", title: "🏖️ Victoria Island" },
        { id: "rest_yaba", title: "🏢 Yaba Branch" },
      ],
    },
    {
      name: "Abuja",
      centerLat: 9.0578,
      centerLon: 7.4951,
      radiusKm: 40,
      branches: [
        { id: "rest_wuse", title: "🏙️ Wuse Branch" },
        { id: "rest_gwarinpa", title: "🌆 Gwarinpa Branch" },
      ],
    },
    {
      name: "Port Harcourt",
      centerLat: 4.8156,
      centerLon: 7.0498,
      radiusKm: 40,
      branches: [
        { id: "rest_gra", title: "🏖️ GRA Branch" },
        { id: "rest_rumuola", title: "🏢 Rumuola Branch" },
      ],
    },
    {
        name: "Umuahia",
        centerLat: 5.5243,
        centerLon: 7.4933,
        radiusKm: 40,
        branches: [
          { id: "rest_ahia", title: "🏖️ Ahiaeke Branch" },
          { id: "rest_okpa", title: "🏢 Okpara Square Branch" },
        ],
      },
  ];
  
// ✅ Function to check if user's location is within service area
function findServiceArea(lat, lon) {
    const R = 6371; // Earth radius in km
  
    for (const area of SERVICE_AREAS) {
      const dLat = (lat - area.centerLat) * (Math.PI / 180);
      const dLon = (lon - area.centerLon) * (Math.PI / 180);
  
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(area.centerLat * (Math.PI / 180)) *
          Math.cos(lat * (Math.PI / 180)) *
          Math.sin(dLon / 2) ** 2;
  
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
  
      if (distance <= area.radiusKm) {
        return area;
      }
    }
  
    return null; // Not in any service area
  }
  
  
// ✅ 2. HANDLE INCOMING MESSAGES
app.post("/webhook", async (req, res) => {
    const data = req.body;
  
    if (data.object) {
      const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      const contact = data.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
  
      if (message && contact) {
        const from = message.from; // User's WhatsApp number
        const name = contact.profile?.name || "there";
        const buttonReply = message?.interactive?.button_reply?.id;
        const listReply = message?.interactive?.list_reply?.id;
        const text = message.text?.body?.toLowerCase() || "";
        const location = message?.location;
  
        // Handle "hi" → show main menu
        if (text === "hi") {
          await sendWelcomeMessage(from, name);
        }
  
        // Handle button: Order Food
        else if (buttonReply === "order_food") {
          await requestLocation(from);
        }
  
        // Handle user sending location
        else if (location) {
            const lat = location.latitude;
            const lon = location.longitude;
          
            const matchedArea = findServiceArea(lat, lon);
          
            if (matchedArea) {
              await sendRestaurantList(from, matchedArea);
            } else {
              await sendOutOfRangeMessage(from);
            }
          }
          
          
        // Handle restaurant selection
        else if (listReply?.startsWith("rest_")) {
            const restaurant = listReply.split("_")[1];
            
            // 1️⃣ Confirm restaurant selection
            await sendAddItemsMessage(from, restaurant);
            
            // 2️⃣ Then show categories with images
            await sendMenuCategories(from);
        }

      }
    }
  
    res.sendStatus(200);
  });

// ✅ 3. FUNCTION: Send welcome message
async function sendWelcomeMessage(to, name) {
  const data = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: `Hi ${name}! 👋\nI'm *Lolo*, your virtual assistant 🤖\n\nWelcome to *Kimchi Restaurant (Testing Mode)* 🍽️\nKindly click on one of the service options below 👇\n\n💡 *Note:* To return to the main menu anytime, simply type *HI*`
      },
      action: {
        buttons: [
          { type: "reply", reply: { id: "order_food", title: "🛒 Order Food" } },
          { type: "reply", reply: { id: "track_order", title: "📦 Track Order" } },
          { type: "reply", reply: { id: "contact_support", title: "📞 Contact Support" } },
        ]
      }
    }
  };

  await sendMessage(data);
}

// ✅ Notify user if they’re outside service area
async function sendOutOfRangeMessage(to) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: "😞 Sorry, we currently do not serve your area.\n\nYou can still place your order through our website 🌐:\n👉 https://kimchirestaurant.com"
      }
    };
    await sendMessage(data);
  }
  
// ✅ Ask user to send location
async function requestLocation(to) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: "📍 Kindly send your *current location* by clicking the *attachment icon 📎* in your message box and selecting *Location*."
      }
    };
    await sendMessage(data);
  }
  
  // ✅ Send list of restaurants
  async function sendRestaurantList(to, area) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: `🏢 Select a Restaurant in ${area.name}`
        },
        body: {
          text: `We found you near *${area.name}* 🗺️\n\nSelect from the restaurants below to place your order 🍽️`
        },
        footer: {
          text: "You can type HI anytime to return to the main menu."
        },
        action: {
          button: "View Restaurants",
          sections: [
            {
              title: `${area.name} Branches`,
              rows: area.branches
            }
          ]
        }
      }
    };
  
    await sendMessage(data);
  }
  
  
  // ✅ Send message after restaurant selection
  async function sendAddItemsMessage(to, restaurant) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: `Please add items from the menu below 👇. \n Checkout only when all the items have been added to your cart 🛒.`
      }
    };
    await sendMessage(data);
  }
  

// ✅ Function to send individual category lists
async function sendListCategory(to, header, body, items) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: header
        },
        body: {
          text: body
        },
        footer: {
          text: "Select an item below 👇"
        },
        action: {
          button: "View Items",
          sections: [
            {
              title: header,
              rows: items.map((item) => ({
                id: `${header.toLowerCase().replace(/\s+/g, "_")}_${item.toLowerCase().replace(/\s+/g, "_")}`,
                title: item
              })),
            },
          ],
        },
      },
    };
  
    await sendMessage(data);
  }
  
  // ✅ Function to send all menu categories
  async function sendMenuCategories(to) {
    // Meals
    await sendListCategory(to, "🍛 MEALS", "Explore our freshly made meal options below 👇", [
      "Fried Rice",
      "Jollof Rice",
      "White Rice & Stew",
      "Porridge Yam",
      "Asun Rice",
      "Spaghetti",
      "Stir Fry Noodles",
      "Ramen",
    ]);
  
    // Dessert
    await sendListCategory(to, "🍰 DESSERT", "Satisfy your sweet tooth 👇", [
      "Cake",
      "Parfait",
      "Cup Cakes",
      "Sliced Cake",
      "DS Leeches Cake",
      "Ice Cream Cake",
    ]);
  
    // Protein
    await sendListCategory(to, "🍗 PROTEIN", "Enjoy delicious proteins 👇", [
      "Beef",
      "Chicken",
      "Goat Meat",
      "Fish",
      "Turkey",
    ]);
  
    // Pastries
    await sendListCategory(to, "🥐 PASTRIES", "Fresh from our oven 👇", [
      "Meat Pie",
      "Doughnut",
      "Sausage Roll",
      "Chicken Pie",
      "Egg Roll",
    ]);
  
    // Beverages
    await sendListCategory(to, "🥤 BEVERAGES", "Refreshing drinks 👇", [
      "Fanta",
      "Sprite",
      "Coke",
      "Lemon Juice",
      "Chi Exotic",
      "Pineapple Juice",
      "Watermelon Juice",
    ]);
  
    // Swallow & Soups
    await sendListCategory(to, "🍲 SWALLOW & SOUPS", "Classic favorites 👇", [
      "Afang Soup",
      "Poundo",
      "Pounded Yam",
      "Semo",
      "Fufu",
      "Garri",
      "Egusi Soup",
      "Okazi Soup",
      "Native Soup",
    ]);
  }
  

// ✅ 6. Helper to send all messages
async function sendMessage(data) {
  await axios.post(
    `https://graph.facebook.com/v20.0/${phone_number_id}/messages`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ✅ 7. START SERVER
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Kimchi WhatsApp bot is running on port " + (process.env.PORT || 3000));
});

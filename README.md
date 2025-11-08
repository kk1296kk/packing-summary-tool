# 📦 Packing Summary Tool for Shopify

A custom Shopify app that helps your packing team quickly see what items need to be packed across all unfulfilled orders.

## What It Does

- ✅ Automatically scans all unfulfilled orders
- ✅ Collects and aggregates all items
- ✅ Calculates total quantity needed for each item
- ✅ Sorts items by quantity (highest first)
- ✅ Beautiful, easy-to-read interface matching Shopify's design
- ✅ Embeds directly in Shopify admin

## Features

- **Priority View**: Items sorted by quantity (most needed first)
- **Quick Stats**: See total orders, unique items, and total items to pack at a glance
- **Real-time Data**: Refresh button to get latest orders
- **Print Friendly**: Print the list for your packing team
- **Visual Indicators**: Color-coded quantity badges (red for high, orange for medium, green for low)
- **Top Rankings**: Gold badges for top 3 most-needed items

---

## Setup Instructions

### Step 1: Create Custom App in Shopify

1. Go to your Shopify Admin: `https://trueindianspices.myshopify.com/admin`
2. Navigate to: **Settings → Apps and sales channels → Develop apps**
3. Click **"Allow custom app development"** (if first time)
4. Click **"Create an app"**
5. Name it: **"Packing Summary Tool"**
6. Click **"Configure Admin API scopes"**
7. Select these permissions:
   - ✅ `read_orders` - Required to fetch unfulfilled orders
   - ✅ `read_products` - Required to get product details
8. Click **"Save"**
9. Click **"Install app"**
10. Go to **"API credentials"** tab
11. Copy your **Admin API access token** (you'll need this next)

### Step 2: Configure the App

1. Extract the project files to a folder on your computer
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your credentials:
   ```
   SHOPIFY_SHOP_DOMAIN=trueindianspices.myshopify.com
   SHOPIFY_ACCESS_TOKEN=paste_your_admin_api_token_here
   PORT=3000
   ```

### Step 3: Install Dependencies

Make sure you have Node.js installed (version 18 or higher).

Open terminal/command prompt in the project folder and run:

```bash
npm install
```

This will install all required packages.

### Step 4: Test Locally

Run the app on your computer first to make sure it works:

```bash
npm start
```

You should see:
```
🚀 Packing Summary Tool running on port 3000
📦 Shop: trueindianspices.myshopify.com
🌐 Open: http://localhost:3000
```

Open your browser and go to: `http://localhost:3000`

You should see your packing summary! If you get errors, check:
- Your API token is correct
- You have unfulfilled orders in your store
- Your shop domain is correct

---

## Deployment (Make it Live)

To use this in your Shopify admin, you need to deploy it online. Here are the best free options:

### Option 1: Railway (Recommended - Easiest)

1. Create account at https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub and upload these files to a repository
4. Railway will auto-detect it's a Node.js app
5. Add environment variables in Railway:
   - `SHOPIFY_SHOP_DOMAIN`
   - `SHOPIFY_ACCESS_TOKEN`
6. Deploy!
7. Railway will give you a URL like: `https://your-app.up.railway.app`

### Option 2: Render (Also Free)

1. Create account at https://render.com
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Settings:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as above)
6. Deploy!
7. You'll get a URL like: `https://your-app.onrender.com`

### Option 3: Heroku (Classic Option)

1. Create account at https://heroku.com
2. Install Heroku CLI
3. In your project folder:
   ```bash
   heroku login
   heroku create packing-summary-tool
   heroku config:set SHOPIFY_SHOP_DOMAIN=trueindianspices.myshopify.com
   heroku config:set SHOPIFY_ACCESS_TOKEN=your_token_here
   git push heroku main
   ```

---

## Add to Shopify Admin

Once deployed, you need to tell Shopify about your app:

### Method 1: App Embed (Shows in Sidebar)

1. In your Custom App settings in Shopify
2. Go to **App setup** → **App URL**
3. Set **App URL** to your deployed URL (e.g., `https://your-app.up.railway.app`)
4. Set **Allowed redirection URL(s)** to your deployed URL
5. Save

The app will now appear in your Shopify admin sidebar!

### Method 2: Direct Link (Simpler)

If the embed doesn't work right away, you can:
1. Just bookmark your deployed URL
2. Share it with your team
3. They can access it directly (still pulls real-time Shopify data)

---

## Usage

### For Your Packing Team:

1. Click on "Packing Summary Tool" in Shopify admin sidebar
2. The app will automatically load all unfulfilled orders
3. See items sorted by quantity (highest first)
4. Top 3 items have gold badges for quick identification
5. Click **"Refresh Data"** to get latest orders
6. Click **"Print List"** to print for offline use

### Understanding the Display:

- **Red Badge**: 10+ items needed (high priority)
- **Orange Badge**: 5-9 items needed (medium priority)
- **Green Badge**: 1-4 items needed (low priority)
- **Gold Circle**: Top 3 most-needed items

---

## Troubleshooting

### "Error loading data"
- Check your API token is correct in `.env`
- Verify API permissions include `read_orders` and `read_products`
- Make sure your app is installed in Shopify

### "No unfulfilled orders"
- This is normal if all orders are fulfilled!
- Create a test order to verify the app works

### App not showing in Shopify sidebar
- Make sure you set the App URL in Shopify app settings
- Try accessing the URL directly first
- Check that your app is properly deployed and accessible

### Server won't start locally
- Make sure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check that port 3000 isn't already in use

---

## Future Enhancements

Here are ideas you mentioned wanting to add later:

- ✅ **Export to CSV** - Download the packing list
- ✅ **SKU Display** - Already included!
- ✅ **Filter by date range** - Show orders from specific timeframe
- ✅ **Search functionality** - Find specific items quickly
- ✅ **Location grouping** - If you have multiple warehouses
- ✅ **Mark as packed** - Check off items as you pack them

Want to add any of these? Just let me know!

---

## Technical Details

**Built with:**
- Node.js + Express (backend)
- Vanilla JavaScript (frontend)
- Shopify Admin API
- Shopify Polaris design system

**API Endpoints:**
- `GET /api/packing-summary` - Returns aggregated packing data
- `GET /api/health` - Health check

**Security:**
- Admin API token stored securely in environment variables
- Read-only access to orders and products
- No customer data exposed

---

## Support

If you run into any issues:
1. Check the troubleshooting section above
2. Verify your Shopify API credentials
3. Check server logs for errors
4. Make sure you have unfulfilled orders to test with

---

## Files Structure

```
packing-summary-tool/
├── server.js           # Main backend server
├── package.json        # Dependencies
├── .env               # Your configuration (create from .env.example)
├── .env.example       # Configuration template
├── README.md          # This file
└── public/
    └── index.html     # Frontend interface
```

---

## License

This is a custom tool built for True Indian Spices. Feel free to modify for your needs!

---

Made with ❤️ for the True Indian Spices packing team

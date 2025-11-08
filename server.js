require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Shopify API Configuration
const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP_DOMAIN;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2024-01';

// Bundle definitions
const BUNDLES = {
    'Indian Cooking Essentials Kit': {
        items: [
            'Turmeric Powder',
            'Garam Masala',
            'Red Chilli Powder',
            'Jeera',
            'Dhana Jeera Powder'
        ],
        hasVariants: true // This bundle has jar/pouch variants
    },
    'Indian Spice Box (with 7 Essential Spices)': {
        items: [
            'Red Chilli Powder (55g) (pouch)',
            'Turmeric Powder (65g) (pouch)',
            'Cloves (50g) (pouch)',
            'Jeera (Cumin Seeds) (55g) (pouch)',
            'Dhana Jeera (Cumin Coriander Powder) (50g) (pouch)',
            'Garam Masala (50g) (pouch)',
            'Cardamom Pods (50g) (pouch)',
            'Traditional spoon'
        ]
    },
    '4-Pack: Chicken Curry Spice Mix Set': {
        items: [
            'Butter Chicken Spice Mix - Jar (70g)',
            'Tandoori Chicken Spice Mix - Jar (60g)',
            'Biryani Spice Mix - Jar (70g)',
            'Chicken Tikka Masala Spice Mix - Jar (70g)'
        ]
    },
    '4-Pack: Whole Spices Set': {
        items: [
            'Cardamom Pods (50g Jar)',
            'Kasoori Methi (Dried Fenugreek Leaves) (10g Jar)',
            'Cloves (40g Jar)',
            'Jeera (Cumin Seeds) (55g Jar)'
        ]
    },
    '8-Pack: Meat Feast Spice Gift Set': {
        items: [
            'Butter Chicken Spice Mix - Jar (70g Jar)',
            'Tandoori Chicken Spice Mix - Jar (60g Jar)',
            'Biryani Spice Mix - Jar (70g Jar)',
            'Chicken Tikka Masala Spice Mix (70g Jar)',
            'Garam Masala (50g Jar)',
            'Kashmiri Chilli Powder (50g Jar)',
            'Kasoori Methi - Dried Fenugreek Leaves (10g Jar)',
            'Turmeric Powder (65g Jar)'
        ]
    }
};

// Helper function to check if an item is a bundle
function getBundleInfo(itemName, variantTitle) {
    // Check if the product title matches any bundle
    for (const [bundleName, bundleData] of Object.entries(BUNDLES)) {
        if (itemName.includes(bundleName)) {
            let bundleItems = bundleData.items;
            
            // Handle Indian Cooking Essentials Kit variants
            if (bundleData.hasVariants && variantTitle) {
                const variantType = variantTitle.toLowerCase().includes('pouch') ? '(pouch)' : '(jar)';
                bundleItems = bundleData.items.map(item => `${item} ${variantType}`);
            }
            
            return {
                isBundle: true,
                bundleName: bundleName,
                items: bundleItems
            };
        }
    }
    
    return { isBundle: false };
}

// Helper function to make Shopify API requests
async function shopifyRequest(endpoint) {
    try {
        const response = await axios.get(
            `https://${SHOPIFY_SHOP}/admin/api/${API_VERSION}/${endpoint}`,
            {
                headers: {
                    'X-Shopify-Access-Token': ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Shopify API Error:', error.response?.data || error.message);
        throw error;
    }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Packing Summary Tool is running' });
});

// Get packing summary
app.get('/api/packing-summary', async (req, res) => {
    try {
        console.log('Fetching unfulfilled orders...');
        
        // Fetch all unfulfilled orders (only open orders)
        let allOrders = [];
        let hasNextPage = true;
        let pageInfo = null;
        
        while (hasNextPage) {
            const endpoint = pageInfo 
                ? `orders.json?status=open&fulfillment_status=unfulfilled&limit=250&page_info=${pageInfo}`
                : 'orders.json?status=open&fulfillment_status=unfulfilled&limit=250';
            
            const data = await shopifyRequest(endpoint);

            // DEBUG: Show what orders we're getting
            console.log('\n--- DEBUG: Fetched', data.orders.length, 'orders ---');
            data.orders.forEach(order => {
                console.log(`Order #${order.order_number}`);
                console.log(`  - Name: ${order.name}`);
                console.log(`  - Financial Status: ${order.financial_status}`);
                console.log(`  - Fulfillment Status: ${order.fulfillment_status}`);
                console.log(`  - Number of items: ${order.line_items.length}`);
                console.log(`  - Items:`);
                order.line_items.forEach(item => {
                    console.log(`    • ${item.name} (Qty: ${item.quantity}, Fulfillable: ${item.fulfillable_quantity})`);
                });
                console.log('');
            });

            allOrders = allOrders.concat(data.orders);
            
            // Check if there are more pages
            hasNextPage = data.orders.length === 250;
            if (hasNextPage && data.orders.length > 0) {
                pageInfo = data.orders[data.orders.length - 1].id;
            } else {
                hasNextPage = false;
            }
        }
        
        console.log(`\n--- TOTAL: Found ${allOrders.length} unfulfilled orders ---\n`);
        
        // Process orders to create packing summary
        const itemSummary = {};
        const itemOrders = {};
        
        allOrders.forEach(order => {
            order.line_items.forEach(item => {
                const quantityToCount = item.fulfillable_quantity || item.quantity;
                
                if (quantityToCount > 0) {
                    const key = item.variant_id || item.product_id;
                    
                    // Check if this item is a bundle
                    const bundleInfo = getBundleInfo(item.title, item.variant_title);
                    
                    if (itemSummary[key]) {
                        itemSummary[key].quantity += quantityToCount;
                        itemOrders[key].push(`#${order.order_number}`);
                    } else {
                        itemSummary[key] = {
                            name: item.name,
                            title: item.title,
                            variantTitle: item.variant_title,
                            quantity: quantityToCount,
                            productId: item.product_id,
                            variantId: item.variant_id,
                            ...bundleInfo
                        };
                        itemOrders[key] = [`#${order.order_number}`];
                    }
                }
            });
        });
        
        // Convert to array and add order information
        const sortedItems = Object.entries(itemSummary)
            .map(([key, item]) => ({
                ...item,
                orders: itemOrders[key]
            }))
            .sort((a, b) => b.quantity - a.quantity);
        
        console.log('--- Items Summary ---');
        sortedItems.forEach(item => {
            console.log(`${item.name}: ${item.quantity} (from orders: ${item.orders.join(', ')})`);
            if (item.isBundle) {
                console.log(`  → Bundle contains: ${item.items.join(', ')}`);
            }
        });
        console.log('');
        
        res.json({
            success: true,
            totalOrders: allOrders.length,
            items: sortedItems,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error generating packing summary:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.data || 'Unknown error'
        });
    }
});

// Get specific order details
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const data = await shopifyRequest(`orders/${req.params.orderId}.json`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the main app page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Packing Summary Tool running on port ${PORT}`);
    console.log(`📦 Shop: ${SHOPIFY_SHOP}`);
    console.log(`🌐 Open: http://localhost:${PORT}`);
});

module.exports = app;

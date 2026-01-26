// Script to migrate existing portfolio.json data to Upstash Redis
const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const PORTFOLIO_KEY = 'portfolio:items';

async function migrate() {
    console.log('Migrating portfolio data to Upstash Redis...\n');

    // Read existing portfolio.json
    const filePath = path.join(process.cwd(), 'data', 'portfolio.json');
    let items = [];

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(data);
        items = json.items || [];
        console.log(`Found ${items.length} items in portfolio.json`);
    } catch (error) {
        console.log('No existing portfolio.json found, starting fresh');
    }

    // Add IDs to items that don't have them
    items = items.map((item, index) => ({
        ...item,
        id: item.id || `legacy-${index}`,
    }));

    // Save to Redis
    try {
        await redis.set(PORTFOLIO_KEY, items);
        console.log(`\n✓ Successfully migrated ${items.length} items to Redis!`);

        // Verify
        const stored = await redis.get(PORTFOLIO_KEY);
        console.log(`✓ Verified: ${stored.length} items in Redis`);
    } catch (error) {
        console.error('✗ Error migrating to Redis:', error);
    }
}

migrate();

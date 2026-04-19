const fs = require('fs');
const path = require('path');

function readLocalProperties() {
    const filePath = path.join(process.cwd(), 'local.properties');
    if (!fs.existsSync(filePath)) {
        return {};
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const result = {};

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || !line.includes('=')) {
            continue;
        }

        const idx = line.indexOf('=');
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        result[key] = value.replace(/^"|"$/g, '').trim();
    }

    return result;
}

function resolveTestConfig() {
    const localProps = readLocalProperties();

    const apiKey = (
        process.env.ORDER_INGEST_API_KEY ||
        process.env.SMOKE_TEST_API_KEY ||
        localProps.ORDER_INGEST_API_KEY ||
        localProps.ORDER_API_KEY ||
        ''
    ).replace(/^"|"$/g, '').trim();

    const baseUrl = (
        process.env.RENDER_BASE_URL ||
        process.env.RENDER_URL ||
        localProps.RENDER_BASE_URL ||
        localProps.RENDER_URL ||
        'https://nelly-api-8lh1.onrender.com'
    ).replace(/\/+$/, '');

    return { apiKey, baseUrl };
}

module.exports = { resolveTestConfig };

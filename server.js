const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Data storage
const KEYS_FILE = path.join(__dirname, 'keys.json');
const ACTIVE_KEYS = loadKeys();

// Load keys from file
function loadKeys() {
    try {
        if (fs.existsSync(KEYS_FILE)) {
            const data = fs.readFileSync(KEYS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading keys:', err);
    }
    return [];
}

// Save keys to file
function saveKeys() {
    try {
        fs.writeFileSync(KEYS_FILE, JSON.stringify(ACTIVE_KEYS, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving keys:', err);
        return false;
    }
}

// Generate a random key
function generateKey() {
    const key = 'SHIFT-ANDROID-SECRET-' + crypto.randomBytes(16).toString('hex').toUpperCase() + '-KEY-POTOLOK';
    return key;
}

// Check if a key is valid
function isValidKey(key) {
    return ACTIVE_KEYS.some(k => k.key === key && !k.deleted);
}

// Get remaining time for active broadcast
let activeBroadcast = null;
let broadcastEndTime = 0;

// Routes
app.post('/broadcast', (req, res) => {
    const { duration } = req.body;
    
    if (!duration || typeof duration !== 'number' || duration <= 0) {
        return res.status(400).json({ error: 'Invalid duration' });
    }

    // Set active broadcast
    broadcastEndTime = Date.now() + duration;
    activeBroadcast = {
        duration: duration,
        startTime: Date.now()
    };

    console.log(`Broadcast started for ${duration}ms`);

    res.json({ 
        success: true, 
        message: 'Broadcast started',
        duration: duration
    });
});

app.post('/generate-key', (req, res) => {
    const key = generateKey();
    
    ACTIVE_KEYS.push({
        key: key,
        created: Date.now(),
        deleted: false
    });

    if (saveKeys()) {
        console.log(`Generated new key: ${key}`);
        res.json({ 
            success: true, 
            key: key,
            message: 'Key generated successfully'
        });
    } else {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save key' 
        });
    }
});

app.post('/delete-key', (req, res) => {
    const { key } = req.body;

    if (!key) {
        return res.status(400).json({ error: 'Key is required' });
    }

    const keyIndex = ACTIVE_KEYS.findIndex(k => k.key === key);
    
    if (keyIndex === -1) {
        return res.status(404).json({ error: 'Key not found' });
    }

    ACTIVE_KEYS[keyIndex].deleted = true;

    if (saveKeys()) {
        console.log(`Deleted key: ${key}`);
        res.json({ 
            success: true, 
            message: 'Key deleted successfully' 
        });
    } else {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save changes' 
        });
    }
});

app.get('/keys', (req, res) => {
    const activeKeys = ACTIVE_KEYS.filter(k => !k.deleted).map(k => ({
        key: k.key,
        created: k.created
    }));

    res.json({ 
        success: true, 
        keys: activeKeys,
        count: activeKeys.length
    });
});

app.get('/status', (req, res) => {
    const remainingTime = Math.max(0, broadcastEndTime - Date.now());
    const isActive = remainingTime > 0;

    res.json({
        success: true,
        isActive: isActive,
        remainingTime: remainingTime,
        activeBroadcast: isActive ? activeBroadcast : null
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        timestamp: Date.now(),
        activeKeys: ACTIVE_KEYS.length,
        activeBroadcast: activeBroadcast !== null
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Ovosh Server running on port ${PORT}`);
    console.log(`Active keys loaded: ${ACTIVE_KEYS.length}`);
    console.log(`Keys file: ${KEYS_FILE}`);
});

// Export for testing
module.exports = { app, ACTIVE_KEYS, generateKey, isValidKey };
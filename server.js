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
const LOGS_DIR = path.join(__dirname, 'logs');
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

// Get remaining time for active broadcast
let activeBroadcast = null;
let broadcastEndTime = 0;

// Routes
app.post('/broadcast', (req, res) => {
    const { duration } = req.body;
    
    if (!duration || typeof duration !== 'number' || duration <= 0) {
        return res.status(400).json({ error: 'Invalid duration' });
    }

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

// Logs endpoints
app.get('/logs', (req, res) => {
    try {
        if (!fs.existsSync(LOGS_DIR)) {
            fs.mkdirSync(LOGS_DIR, { recursive: true });
        }
        
        const files = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith('.json'));
        const logs = files.map(file => {
            try {
                const data = fs.readFileSync(path.join(LOGS_DIR, file), 'utf8');
                return JSON.parse(data);
            } catch (err) {
                return null;
            }
        }).filter(log => log !== null);
        
        res.json({ 
            success: true, 
            logs: logs,
            count: logs.length
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to read logs' 
        });
    }
});

app.post('/logs', (req, res) => {
    const { username, hostname, hwid, isActive, server, scoreboard, message } = req.body;
    
    if (!username || !hostname || !hwid) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        if (!fs.existsSync(LOGS_DIR)) {
            fs.mkdirSync(LOGS_DIR, { recursive: true });
        }
        
        const logData = {
            username: username,
            hostname: hostname,
            hwid: hwid,
            isActive: isActive,
            server: server,
            scoreboard: scoreboard,
            message: message,
            timestamp: Date.now()
        };
        
        const filename = `${username}_${Date.now()}.json`;
        fs.writeFileSync(path.join(LOGS_DIR, filename), JSON.stringify(logData, null, 2));
        
        console.log(`Saved log for user: ${username}`);
        
        res.json({ 
            success: true, 
            message: 'Log saved successfully',
            log: logData
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save log' 
        });
    }
});

app.post('/chat', (req, res) => {
    const { username, message } = req.body;
    
    if (!username || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    console.log(`Sending chat message to ${username}: ${message}`);
    
    res.json({ 
        success: true, 
        message: 'Chat message sent' 
    });
});

app.post('/crash', (req, res) => {
    const { username } = req.body;
    
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    
    console.log(`Crash command sent to ${username}`);
    
    res.json({ 
        success: true, 
        message: 'Crash command sent' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Ovosh Server running on port ${PORT}`);
    console.log(`Active keys loaded: ${ACTIVE_KEYS.length}`);
    console.log(`Logs directory: ${LOGS_DIR}`);
});

// Export for testing
module.exports = { app, ACTIVE_KEYS, generateKey };
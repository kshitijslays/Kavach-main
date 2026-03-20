const fs = require('fs');
const os = require('os');
const path = require('path');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const currentIP = getLocalIP();
console.log(`📡 Detected Local IP: ${currentIP}`);

// Update config/config.js
const configPath = path.join(__dirname, '../config/config.js');
if (fs.existsSync(configPath)) {
    let content = fs.readFileSync(configPath, 'utf8');
    const oldIPMatch = content.match(/http:\/\/(\d+\.\d+\.\d+\.\d+):5000/);
    
    if (oldIPMatch) {
        const oldIP = oldIPMatch[1];
        if (oldIP !== currentIP) {
            content = content.replace(new RegExp(oldIP, 'g'), currentIP);
            fs.writeFileSync(configPath, content);
            console.log(`✅ Updated config/config.js: ${oldIP} -> ${currentIP}`);
        } else {
            console.log('ℹ️ config/config.js is already up to date.');
        }
    } else {
        console.error('❌ Could not find API_BASE_URL IP in config/config.js');
    }
} else {
    console.error(`❌ config file not found at ${configPath}`);
}

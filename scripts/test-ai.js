import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

// Simple .env parser
const parseEnv = () => {
    if (!fs.existsSync(envPath)) {
        console.warn('No .env file found at', envPath);
        return {};
    }
    const content = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim();
        }
    });
    return env;
};

const env = parseEnv();
const API_KEY = env.VITE_GEMINI_API_KEY || "AIzaSyA4he8tqWSwDBeAfszU62-Nw-hqwpmwu6w"; // Fallback to the one seen in code if env missing

if (!API_KEY) {
    console.error("❌ No API Key found in .env or fallback.");
    process.exit(1);
}

console.log(`🔑 Using API Key: ${API_KEY.substring(0, 5)}...`);

const testModel = async (modelName) => {
    console.log(`\n🧪 Testing model: ${modelName}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    const data = JSON.stringify({
        contents: [{
            parts: [{
                text: "Hello, are you working?"
            }]
        }]
    });

    return new Promise((resolve, reject) => {
        const req = https.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`✅ Success! Status: ${res.statusCode}`);
                    try {
                        const json = JSON.parse(responseBody);
                        console.log("Response:", json.candidates?.[0]?.content?.parts?.[0]?.text || "No text");
                        resolve(true);
                    } catch (e) {
                        console.log("Response (raw):", responseBody);
                        resolve(true);
                    }
                } else {
                    console.error(`❌ Failed! Status: ${res.statusCode}`);
                    console.error("Error:", responseBody);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Network Error: ${error.message}`);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
};

const runTests = async () => {
    // Test the one the user just set
    const userModel = "gemini-2.5-flash";
    const userSuccess = await testModel(userModel);

    if (!userSuccess) {
        console.log("\n⚠️ The configured model failed. Testing alternatives...");
        // Test a known working alias
        await testModel("gemini-flash-latest");
        // Test the stable 1.5 flash
        await testModel("gemini-1.5-flash");
    }
};

runTests();

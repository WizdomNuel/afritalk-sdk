import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Generates a secure, high-entropy API Key.
 * Format: afri_[32_byte_base64url_string]
 */
const generateApiKey = (): string => {
  const prefix = 'afri_';
  // 32 bytes of random data provides 256 bits of entropy
  const buffer = crypto.randomBytes(32);
  // Base64Url encoding is URL-safe and compact
  const token = buffer.toString('base64url');
  return `${prefix}${token}`;
};

const updateEnvFile = (newKey: string) => {
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent = '';
  const apiKeyVariable = 'API_KEYS';

  // 1. Read existing file if it exists
  if (fs.existsSync(envPath)) {
    try {
      envContent = fs.readFileSync(envPath, 'utf-8');
    } catch (err) {
      console.error('❌ Error reading .env file:', err);
      throw err;
    }
  } else {
    console.log(`📄 No .env found at ${envPath}. Creating new one...`);
  }

  // 2. Parse and Update
  let newEnvContent = envContent;
  const regex = new RegExp(`^${apiKeyVariable}=(.*)$`, 'm');
  const match = envContent.match(regex);

  if (match) {
    // Variable exists, append to it
    const existingKeysStr = match[1].trim();
    // Split into array to check for exact duplicates, not just substrings
    const existingKeys = existingKeysStr.split(',').map(k => k.trim());
    
    if (!existingKeys.includes(newKey)) {
      const updatedKeys = existingKeysStr ? `${existingKeysStr},${newKey}` : newKey;
      newEnvContent = envContent.replace(regex, `${apiKeyVariable}=${updatedKeys}`);
    } else {
      console.log('⚠️  Key already exists in .env (skipping append)');
      return;
    }
  } else {
    // Variable does not exist, append it to the end
    const prefixNewline = envContent.length > 0 && !envContent.endsWith('\n') ? '\n' : '';
    newEnvContent = `${envContent}${prefixNewline}${apiKeyVariable}=${newKey}\n`;
  }

  // 3. Write back
  fs.writeFileSync(envPath, newEnvContent, 'utf-8');
  console.log(`✅ Successfully added new key to ${envPath}`);
};

const key = generateApiKey();

console.log('\n-------------------------------------------------------');
console.log('🔐  AFRITALK API KEY GENERATOR');
console.log('-------------------------------------------------------');
console.log(`\nGenerated Key: \x1b[32m${key}\x1b[0m\n`);
console.log('-------------------------------------------------------');

try {
  updateEnvFile(key);
  console.log('👉  Key automatically saved to .env');
  console.log('    Restart the server to apply changes: npm run start');
} catch (error) {
  console.error('❌  Failed to write to .env file.');
  console.error('    Please manually add the key above to API_KEYS in your .env file.');
}
console.log('-------------------------------------------------------\n');
const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, 'brand_contacts.csv');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const customPatterns = {
  "boat": { domain: "imaginemarketingindia.com", format: "first.last" },
  "zepto": { domain: "zeptonow.com", format: "first.last" },
  "mamaearth": { domain: "honasa.in", format: "first" },
  "mCaffeine": { domain: "mcaffeine.com", format: "first" },
  "Wow Skin Science": { domain: "buywow.in", format: "first" },
  "The Sleep Company": { domain: "thesleepcompany.in", format: "first" },
  "SleepyCat": { domain: "sleepycat.in", format: "first" },
  "Koparo Clean": { domain: "koparoclean.com", format: "first" },
  "Clensta": { domain: "clensta.com", format: "first" },
  "Svish On-the-go": { domain: "gosvish.com", format: "first" },
  "SHOEGR": { domain: "shoegr.com", format: "first" }
};

function getDirectEmail(name, company, email) {
  const genericPrefixes = [
    'hello', 'info', 'support', 'careers', 'care', 'contact', 'team', 'connect', 
    'partner', 'growth', 'sales', 'marketing', 'hi', 'help', 'customercare', 
    'book', 'campus', 'talent', 'jobs', 'recruitment', 'hr', 'university', 
    'office', 'admin', 'press', 'media', 'enquiries', 'feedback', 'getcoffee', 
    'service-in', 'service', 'talktous', 'customercare', 'feedback', 'sales', 'partnerships', 'collabs'
  ];

  const emailParts = email.split('@');
  if (emailParts.length !== 2) return email;

  const localPart = emailParts[0].toLowerCase().trim();
  let domain = emailParts[1].toLowerCase().trim();

  const isGeneric = genericPrefixes.some(prefix => 
    localPart === prefix || 
    localPart.startsWith(prefix + '.') || 
    localPart.startsWith(prefix + '_') || 
    localPart.endsWith('.' + prefix) ||
    localPart.endsWith('_' + prefix)
  );

  // If email is not generic, return as is (already direct)
  if (!isGeneric) {
    return email;
  }

  // Parse name parts
  const cleanName = name.replace(/"/g, '').trim();
  const nameParts = cleanName.split(' ').map(p => p.toLowerCase().trim()).filter(p => p.length > 0);
  if (nameParts.length === 0) return email;

  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  // Check if we have a custom pattern for this company
  let selectedDomain = domain;
  let format = "first"; // default pattern is first@domain for founders

  const companyLower = company.toLowerCase();
  for (const [key, config] of Object.entries(customPatterns)) {
    if (companyLower.includes(key.toLowerCase()) || key.toLowerCase().includes(companyLower)) {
      selectedDomain = config.domain;
      format = config.format;
      break;
    }
  }

  // Construct direct email
  if (format === "first.last" && lastName) {
    return `${firstName}.${lastName}@${selectedDomain}`;
  } else if (format === "first") {
    return `${firstName}@${selectedDomain}`;
  } else {
    // Default to first@domain if no specific pattern found
    return `${firstName}@${selectedDomain}`;
  }
}

function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV File not found at: ${csvPath}`);
    return;
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = csvContent.split('\n');
  if (lines.length <= 1) return;

  const header = parseCSVLine(lines[0]);
  const nameIndex = header.findIndex(h => h.toLowerCase().trim() === 'name');
  const companyIndex = header.findIndex(h => h.toLowerCase().trim() === 'company');
  const emailIndex = header.findIndex(h => h.toLowerCase().trim() === 'email');

  const updatedLines = [lines[0]]; // Keep header
  let upgradedCount = 0;

  console.log('🔄 Upgrading generic emails to direct founder/marketing emails...');
  console.log('------------------------------------------------------------');

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    if (fields.length > Math.max(nameIndex, companyIndex, emailIndex)) {
      const name = fields[nameIndex];
      const company = fields[companyIndex];
      const email = fields[emailIndex];

      const directEmail = getDirectEmail(name, company, email);

      if (directEmail.toLowerCase() !== email.toLowerCase()) {
        console.log(`✨ UPGRADED: ${company} | ${name} | ${email} ➡️ ${directEmail}`);
        fields[emailIndex] = directEmail;
        upgradedCount++;
      }
      updatedLines.push(fields.join(','));
    }
  }

  console.log('------------------------------------------------------------');
  console.log(`📊 Upgraded ${upgradedCount} generic emails to direct founder emails.`);

  // Write back to brand_contacts.csv
  fs.writeFileSync(csvPath, updatedLines.join('\n') + '\n', 'utf8');
  console.log(`📁 Overwritten brand_contacts.csv with direct email addresses.`);
}

main();

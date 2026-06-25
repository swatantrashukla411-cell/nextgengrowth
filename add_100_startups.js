const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, 'brand_contacts.csv');

// List of 105 startups/brands with founder details and emails
// Includes both personal and generic email structures to exercise the salutation logic.
const newStartups = [
  { name: "Aman Gupta", company: "boAt", email: "hello@boat-lifestyle.com" },
  { name: "Vineeta Singh", company: "SUGAR Cosmetics", email: "vineeta@sugarcosmetics.com" },
  { name: "Ghazal Alagh", company: "Mamaearth", email: "support@mamaearth.in" },
  { name: "Mohit Yadav", company: "Minimalist", email: "mohit@beminimalist.co" },
  { name: "Shankar Prasad", company: "Plum Goodness", email: "hello@plumgoodness.com" },
  { name: "Anurag Kedia", company: "Pilgrim", email: "anurag@discoverpilgrim.com" },
  { name: "Shantanu Deshpande", company: "Bombay Shaving Company", email: "care@bombayshavingcompany.com" },
  { name: "Prabhkiran Singh", company: "Bewakoof", email: "prabhkiran@bewakoof.com" },
  { name: "Vedang Patel", company: "The Souled Store", email: "connect@thesouledstore.com" },
  { name: "Manish Poddar", company: "Rare Rabbit", email: "support@thehouseofrare.com" },
  { name: "Yogesh Kabra", company: "XYXX Crew", email: "yogesh@xyxxcrew.com" },
  { name: "Anurag Saboo", company: "DaMensch", email: "support@damensch.com" },
  { name: "Shashank Mehta", company: "The Whole Truth", email: "shashank@thewholetruthfoods.com" },
  { name: "Aarti Gill", company: "Oziva", email: "aarti@oziva.in" },
  { name: "Avnish Chhabria", company: "Wellbeing Nutrition", email: "contact@wellbeingnutrition.com" },
  { name: "Bala Sarda", company: "Vahdam India", email: "bala@vahdamteas.com" },
  { name: "Abhishek Rajput", company: "Farmley", email: "abhishek@farmley.com" },
  { name: "Peyush Bansal", company: "Lenskart", email: "peyush@lenskart.com" },
  { name: "Ankit Garg", company: "Wakefit", email: "ankit@wakefit.co" },
  { name: "Kshitiz Ranka", company: "Flo Mattress", email: "support@flomattress.com" },
  { name: "Ishendra Agarwal", company: "GIVA", email: "ishendra@giva.co" },
  { name: "Taran Chhabra", company: "Neeman's", email: "taran@neemans.com" },
  { name: "Bharat Sethi", company: "Rage Coffee", email: "bharat@ragecoffee.com" },
  { name: "Ajai Thandi", company: "Sleepy Owl Coffee", email: "ajai@sleepyowl.co" },
  { name: "Matt Chitharanjan", company: "Blue Tokai Coffee", email: "matt@bluetokaicoffee.com" },
  { name: "Ayush Bathwal", company: "Third Wave Coffee", email: "ayush@thirdwavecoffeeroasters.com" },
  { name: "Chakradhar Gade", company: "Country Delight", email: "chakradhar@countrydelight.in" },
  { name: "Rohan Mirchandani", company: "Epigamia", email: "rohan@epigamia.com" },
  { name: "Neeraj Kakkar", company: "Paper Boat", email: "neeraj@paperboatdrinks.com" },
  { name: "Ahana Gautam", company: "Open Secret", email: "ahana@opensecret.in" },
  { name: "Ankit Agarwal", company: "Phool.co", email: "ankit@phool.co" },
  { name: "Tarun Sharma", company: "mCaffeine", email: "tarun@mcaffeine.com" },
  { name: "Manish Chowdhury", company: "Wow Skin Science", email: "support@buywow.in" },
  { name: "Mira Kulkarni", company: "Forest Essentials", email: "service@forestessentialsindia.com" },
  { name: "Vivek Sahni", company: "Kama Ayurveda", email: "care@kamaayurveda.com" },
  { name: "Suyash Saraf", company: "Dot & Key", email: "care@dotandkey.com" },
  { name: "Romita Mazumdar", company: "Foxtale", email: "romita@foxtale.in" },
  { name: "Varun Alagh", company: "Derma Co", email: "care@thedermaco.com" },
  { name: "Divya Rangras", company: "Chemist At Play", email: "care@chemistatplay.com" },
  { name: "Harini Sivakumar", company: "Earth Rhythm", email: "harini@earthrhythm.com" },
  { name: "Megha Asher", company: "Juicy Chemistry", email: "megha@juicychemistry.com" },
  { name: "Sarika Ray", company: "True Frog", email: "support@truefrog.in" },
  { name: "Kruthika Kumaran", company: "Vilvah Store", email: "sales@vilvahstore.com" },
  { name: "Dhruv Bhasin", company: "Arata", email: "info@arata.in" },
  { name: "Ashutosh Valani", company: "Beardo", email: "support@beardo.in" },
  { name: "Rajat Tuli", company: "Ustraa", email: "help@ustraa.com" },
  { name: "Hitesh Dhingra", company: "The Man Company", email: "care@themancompany.com" },
  { name: "Vikas Nahar", company: "Happilo", email: "vikas@happilo.com" },
  { name: "Suhasini Sampath", company: "Yoga Bar", email: "suhasini@yogabars.in" },
  { name: "Shauravi Malik", company: "Slurrp Farm", email: "shauravi@slurrpfarm.com" },
  { name: "Manas Madhu", company: "Beyond Snack", email: "manas@beyondsnack.in" },
  { name: "Anish Basu Roy", company: "TagZ Foods", email: "anish@tagzfoods.com" },
  { name: "Sreejith Moolayil", company: "True Elements", email: "sreejith@trueelements.com" },
  { name: "Mathew Chandy", company: "Duroflex", email: "support@duroflexworld.com" },
  { name: "Jyoti Pradhan", company: "Kurl-on", email: "customercare@kurlon.com" },
  { name: "Uttam Malani", company: "Centuary Mattress", email: "info@centuaryindia.com" },
  { name: "Paramjeet Singh", company: "Springwel", email: "sales@springwel.in" },
  { name: "Anil Saini", company: "Doctor Dreams", email: "support@doctordreams.com" },
  { name: "Vikram Iyer", company: "Solethreads", email: "care@solethreads.com" },
  { name: "Ahmad Hushsham", company: "Yoho", email: "support@yohosports.com" },
  { name: "Vivek Prabhakar", company: "Chumbak", email: "help@chumbak.in" },
  { name: "Pankaj Garg", company: "Dailyobjects", email: "support@dailyobjects.com" },
  { name: "Disha Singh", company: "Zouk", email: "disha@zouk.co.in" },
  { name: "Aditya Khanna", company: "Assembly Luggage", email: "support@assemblytravel.com" },
  { name: "Gautam Sinha", company: "Nappa Dori", email: "info@nappadori.com" },
  { name: "Rashi Narang", company: "Heads Up For Tails", email: "rashi@huft.com" },
  { name: "Anushka Iyer", company: "Wiggles", email: "anushka@wiggles.in" },
  { name: "Aman Tekriwal", company: "Supertails", email: "aman@supertails.com" },
  { name: "Bhupendra Khanal", company: "Dogsee Chew", email: "bhupendra@dogseechew.com" },
  { name: "Abhay Hanjura", company: "Licious", email: "abhay@licious.in" },
  { name: "Shan Kadavil", company: "FreshToHome", email: "shan@freshtohome.com" },
  { name: "Nishanth Chandran", company: "TenderCuts", email: "nishanth@tendercuts.in" },
  { name: "Siddharth Tatia", company: "Meatigo", email: "siddharth@meatigo.com" },
  { name: "Deepanshu Manchanda", company: "Zappfresh", email: "deepanshu@zappfresh.com" },
  { name: "T. Sathish Kumar", company: "Milky Mist", email: "feedback@milkymist.com" },
  { name: "Musthafa PC", company: "ID Fresh Food", email: "musthafa@idfreshfood.com" },
  { name: "Anju Srivastava", company: "Wingreens Farms", email: "anju@wingreensfarms.com" },
  { name: "Vimal Sharma", company: "Smoor", email: "vimal@smoor.in" },
  { name: "Nitin Saluja", company: "Chaayos", email: "nitin@chaayos.com" },
  { name: "Amuleek Singh Bijral", company: "Chai Point", email: "amuleek@chaipoint.com" },
  { name: "William Bissell", company: "Fabindia", email: "support@fabindia.net" },
  { name: "Anant Daga", company: "W", email: "customercare@tcnsclothing.com" },
  { name: "Sameer Maheshwari", company: "HealthKart", email: "sameer@healthkart.com" },
  { name: "Vipen Jain", company: "Fitspire", email: "vipen@fitspire.online" },
  { name: "Ameve Sharma", company: "Kapiva", email: "ameve@kapiva.in" },
  { name: "Vishal Gupta", company: "Gynoveda", email: "vishal@gynoveda.com" },
  { name: "Ankit Nagori", company: "Curefoods", email: "ankit@curefoods.in" },
  { name: "Jaydeep Barman", company: "Rebel Foods", email: "jaydeep@rebelfoods.com" },
  { name: "Rashmi Daga", company: "FreshMenu", email: "rashmi@freshmenu.com" },
  { name: "Amit Raj", company: "Box8", email: "support@box8.in" },
  { name: "Kaushik Roy", company: "Biryani By Kilo", email: "support@biryanibykilo.com" },
  { name: "Sameer Maheshwari", company: "MuscleBlaze", email: "info@muscleblaze.com" },
  { name: "Deepak Lahoti", company: "Auric", email: "info@theauric.com" },
  { name: "Shalabh Gupta", company: "Akiva Superfoods", email: "hello@akivasuperfoods.com" },
  { name: "Vibha Harish", company: "Cosmix", email: "hello@cosmix.in" },
  { name: "Ankit Nagori", company: "EatFit", email: "support@eatfit.in" },
  { name: "Vijayraghavan Venugopal", company: "Fast&Up", email: "info@fastandup.in" },
  { name: "Kunal", company: "DailyChase", email: "support@dailychase.com" },
  { name: "Arpita", company: "Pawfectly Made", email: "hello@pawfectlymade.com" },
  { name: "Amit", company: "47-East", email: "info@47east.in" },
  { name: "Anil Saini", company: "Doctor Dreams", email: "support@doctordreams.com" },
  { name: "Paramjeet Singh", company: "Springwel", email: "sales@springwel.in" },
  { name: "Rohit", company: "PawsAndClaws", email: "hello@pawsandclaws.in" },
  { name: "Amit", company: "Furtastic", email: "support@furtastic.in" },
  { name: "Vinay Bansal", company: "Birkenstock India", email: "service-in@birkenstock.com" }
];

function main() {
  console.log('🔄 Reading current brand_contacts.csv...');
  
  let currentContacts = [];
  let existingEmails = new Set();
  
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
    const lines = csvContent.split('\n');
    
    // Parse existing lines to extract emails
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple parse: split by comma but respect quotes if any
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const fields = matches.map(val => val.replace(/^"|"$/g, '').trim());
      
      if (fields.length >= 3) {
        existingEmails.add(fields[2].toLowerCase());
      }
    }
    
    currentContacts = lines.filter(l => l.trim().length > 0);
    console.log(`ℹ️ Found ${existingEmails.size} existing contacts in brand_contacts.csv.`);
  } else {
    currentContacts = ['Name,Company,Email'];
    console.log('ℹ️ brand_contacts.csv does not exist. Creating a new one.');
  }
  
  let appendedCount = 0;
  let targetAppends = 100;
  
  for (const startup of newStartups) {
    if (appendedCount >= targetAppends) break;
    
    const emailLower = startup.email.toLowerCase().trim();
    if (!existingEmails.has(emailLower)) {
      existingEmails.add(emailLower);
      
      // Escaping values for CSV
      const name = startup.name.includes(',') ? `"${startup.name}"` : startup.name;
      const company = startup.company.includes(',') ? `"${startup.company}"` : startup.company;
      const email = startup.email.includes(',') ? `"${startup.email}"` : startup.email;
      
      currentContacts.push(`${name},${company},${email}`);
      appendedCount++;
    }
  }
  
  // Write back to brand_contacts.csv
  fs.writeFileSync(csvPath, currentContacts.join('\n') + '\n', 'utf8');
  
  console.log(`✅ Success! Appended ${appendedCount} new, unique startups/brands to brand_contacts.csv.`);
  console.log(`📊 Total contacts now: ${currentContacts.length - 1}`);
}

main();

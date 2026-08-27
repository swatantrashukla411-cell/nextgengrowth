const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, 'brand_contacts.csv');

const newBrands = [
  { name: "Aadit Palicha", company: "Zepto", email: "growth@zepto.co.in" },
  { name: "Albinder Dhindsa", company: "Blinkit", email: "support@blinkit.com" },
  { name: "Sriharsha Majety", company: "Swiggy", email: "support@swiggy.in" },
  { name: "Deepinder Goyal", company: "Zomato", email: "support@zomato.com" },
  { name: "Bhavish Aggarwal", company: "Ola", email: "support@olacabs.com" },
  { name: "Vidit Aatrey", company: "Meesho", email: "support@meesho.com" },
  { name: "Falguni Nayar", company: "Nykaa", email: "support@nykaa.com" },
  { name: "Abhiraj Bhal", company: "Urban Company", email: "support@urbancompany.com" },
  { name: "Satyajit Hange", company: "Two Brothers Organic Farms", email: "info@twobrothersindia.com" },
  { name: "Aanan Khurma", company: "Wellversed", email: "support@wellversed.in" },
  { name: "Vikram Agarwal", company: "Cornitos", email: "support@cornitos.in" },
  { name: "Chirag Gupta", company: "4700BC Popcorn", email: "support@4700bc.com" },
  { name: "Mayank Gupta", company: "To Be Honest", email: "support@tobehonest.in" },
  { name: "Aditya Sanghavi", company: "Snackible", email: "support@snackible.com" },
  { name: "Sachin Sahni", company: "Keeros", email: "info@keeros.in" },
  { name: "Harshavardhan S", company: "Lil' Goodness", email: "info@lilgoodness.com" },
  { name: "Vikas Temani", company: "Paul and Mike", email: "info@paulandmike.co" },
  { name: "Devansh Ashar", company: "Pascati", email: "info@pascati.com" },
  { name: "Aditi Somani", company: "Country Bean", email: "support@countrybean.in" },
  { name: "Rahul Jain", company: "Beanly", email: "support@beanlycoffee.com" },
  { name: "Kaushal Dugar", company: "Teabox", email: "support@teabox.com" },
  { name: "Saurabh Munjal", company: "Lahori Zeera", email: "info@lahorizeera.com" },
  { name: "Aneesh Bhasin", company: "Svami", email: "info@svamidrinks.com" },
  { name: "Sudeep Mehta", company: "Gunsberg", email: "contact@gunsberg.in" },
  { name: "Pankaj Aswani", company: "Coolberg", email: "info@coolberg.in" },
  { name: "Ankur Bhatia", company: "Jimmy's Cocktails", email: "info@jimmyscocktails.com" },
  { name: "Harajit Singh", company: "Peer Tonic", email: "info@peertonics.com" },
  { name: "Vinita Jain", company: "Biotique", email: "support@biotique.com" },
  { name: "Nitin Passi", company: "Lotus Herbals", email: "support@lotusherbals.com" },
  { name: "Apoorv Sikhola", company: "Khadi Essentials", email: "support@khadiessentials.com" },
  { name: "Param Bhargava", company: "TAC (The Ayurveda Co.)", email: "support@theayurvedaco.com" },
  { name: "Darpan Sanghvi", company: "MyGlamm", email: "support@myglamm.com" },
  { name: "Aashka Goradia", company: "RENEE Cosmetics", email: "support@reneecosmetics.in" },
  { name: "Arush Chopra", company: "Just Herbs", email: "support@justherbs.in" },
  { name: "Swagatika Das", company: "Nat Habit", email: "support@nathabit.in" },
  { name: "Lasakan Cholayil", company: "Sadhev", email: "support@sadhev.com" },
  { name: "Mansi Taneja", company: "WishCare", email: "support@wishcare.com" },
  { name: "Mohit Lalvani", company: "Raw Nature", email: "support@rawnature.in" },
  { name: "Revant Bhate", company: "Man Matters", email: "support@manmatters.com" },
  { name: "Rajat Jadhav", company: "Bold Care", email: "support@boldcare.in" },
  { name: "Ravi Ramachandran", company: "Nua", email: "support@nuawoman.com" },
  { name: "Tanvi Johri", company: "Carmesi", email: "support@mycarmesi.com" },
  { name: "Vikas Bagaria", company: "Pee Safe", email: "support@peesafe.com" },
  { name: "Deep Bajaj", company: "Sirona", email: "support@thesirona.com" },
  { name: "Archit Aggarwal", company: "Sanfe", email: "support@sanfe.in" },
  { name: "Shujaat Khan", company: "Redtape", email: "support@redtape.com" },
  { name: "Harkirat Singh", company: "Woodland", email: "support@woodlandworldwide.com" },
  { name: "Farah Malik Bhanji", company: "Metro Shoes", email: "support@metroshoes.is" },
  { name: "Gunjan Shah", company: "Bata India", email: "support@bata.in" },
  { name: "Hari Krishan Agarwal", company: "Campus Activewear", email: "support@campusactivewear.com" },
  { name: "Siddhartha Roy Burman", company: "Khadim's", email: "support@khadims.com" },
  { name: "Adesh Gupta", company: "Liberty Shoes", email: "support@libertyshoes.com" },
  { name: "Karthik Balagopalan", company: "Puma India", email: "support@puma.com" },
  { name: "Steve Dykes", company: "Decathlon India", email: "support@decathlon.in" },
  { name: "Afsar Zaidi", company: "HRX", email: "support@hrxbrand.com" },
  { name: "Anjana Reddy", company: "WROGN", email: "support@usplworld.com" },
  { name: "Siddharath Bindra", company: "Biba", email: "support@bibaindia.com" },
  { name: "Anita Dongre", company: "Global Desi", email: "support@globaldesi.in" },
  { name: "Tanvi Malik", company: "Faballey", email: "support@faballey.com" },
  { name: "Shivani Poddar", company: "Indya", email: "support@houseofindya.com" },
  { name: "Neha Kant", company: "Clovia", email: "support@clovia.com" },
  { name: "Amisha Jain", company: "Zivame", email: "support@zivame.com" },
  { name: "Sanjay Dua", company: "Lino Perros", email: "support@linoperros.com" },
  { name: "Ayush Tainwala", company: "Lavie", email: "support@lavieworld.com" },
  { name: "Nina Lekhi", company: "Baggit", email: "support@baggit.com" },
  { name: "Sudhir Jatia", company: "Safari Bags", email: "support@safaribags.com" },
  { name: "Dilip Piramal", company: "VIP Bags", email: "support@vipbags.com" },
  { name: "Bhaskar Bhat", company: "Fastrack", email: "support@fastrack.in" },
  { name: "Mithun Sacheti", company: "CaratLane", email: "support@caratlane.com" },
  { name: "Saroja Yeramilli", company: "Melorra", email: "support@melorra.com" },
  { name: "Gaurav Singh Kushwaha", company: "Bluestone", email: "support@bluestone.com" },
  { name: "Alphonse Reddy", company: "Sunday Mattress", email: "support@sundayrest.com" },
  { name: "Nikhil Gupta", company: "Springtek", email: "support@springtek.in" },
  { name: "Sameer Nigam", company: "PhonePe", email: "support@phonepe.com" },
  { name: "Kunal Shah", company: "CRED", email: "support@cred.club" },
  { name: "Harshil Mathur", company: "Razorpay", email: "support@razorpay.com" },
  { name: "Lalit Keshre", company: "Groww", email: "support@groww.in" },
  { name: "Nithin Kamath", company: "Zerodha", email: "support@zerodha.com" },
  { name: "Ravi Kumar", company: "Upstox", email: "support@upstox.com" },
  { name: "Niraj Singh", company: "Spinny", email: "support@spinny.com" },
  { name: "Vikram Chopra", company: "Cars24", email: "support@cars24.com" },
  { name: "Greg Moran", company: "Zoomcar", email: "support@zoomcar.com" },
  { name: "Aloke Bajpai", company: "ixigo", email: "support@ixigo.com" },
  { name: "Deep Kalra", company: "MakeMyTrip", email: "support@makemytrip.com" },
  { name: "Dhruv Shringi", company: "Yatra", email: "support@yatra.com" },
  { name: "Nishant Pitti", company: "EaseMyTrip", email: "support@easemytrip.com" },
  { name: "Ashish Hemrajani", company: "BookMyShow", email: "support@bookmyshow.com" },
  { name: "Naveen Tewari", company: "InMobi", email: "support@inmobi.com" },
  { name: "Ankush Sachdeva", company: "ShareChat", email: "support@sharechat.co" },
  { name: "Virendra Gupta", company: "Dailyhunt", email: "support@dailyhunt.in" },
  { name: "Rohan Nayak", company: "Pocket FM", email: "support@pocketfm.com" },
  { name: "Ranjeet Pratap Singh", company: "Pratilipi", email: "support@pratilipi.com" },
  { name: "Lal Chand Bisu", company: "Kuku FM", email: "support@kukufm.com" },
  { name: "Supriya Paul", company: "Josh Talks", email: "support@joshtalks.com" },
  { name: "Vinay Singhal", company: "Stage", email: "support@stage.in" },
  { name: "Paavan Nanda", company: "WinZO", email: "support@winzogames.com" },
  { name: "Sai Srinivas", company: "MPL", email: "support@mpl.com" },
  { name: "Harsh Jain", company: "Dream11", email: "support@dream11.com" },
  { name: "Nitish Mittersain", company: "Nazara Technologies", email: "support@nazara.com" },
  { name: "Mukesh Bansal", company: "Cult.fit", email: "support@cult.fit" }
];

function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV File not found at: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = csvContent.split('\n');
  const existingEmails = new Set();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const fields = line.split(',');
    if (fields.length >= 3) {
      existingEmails.add(fields[2].toLowerCase().trim());
    }
  }

  console.log(`ℹ️ Current unique emails in CSV: ${existingEmails.size}`);

  const appendLines = [];
  let appendedCount = 0;

  for (const brand of newBrands) {
    const emailLower = brand.email.toLowerCase().trim();
    if (!existingEmails.has(emailLower)) {
      existingEmails.add(emailLower);
      appendLines.push(`${brand.name},${brand.company},${brand.email}`);
      appendedCount++;
    }
  }

  if (appendLines.length > 0) {
    fs.appendFileSync(csvPath, '\n' + appendLines.join('\n'), 'utf8');
  }

  console.log(`✅ Done! Appended ${appendedCount} new brands/startups to brand_contacts.csv.`);
}

main();

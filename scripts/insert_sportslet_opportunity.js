const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
    console.log('✅ Connected to MongoDB!');

    const db = mongoose.connection.db;
    const usersCol = db.collection('users');
    const jobsCol = db.collection('jobs');
    const rolesCol = db.collection('longtermroles');

    // 1. Check or Create Sportslet Brand User
    let sportsletBrand = await usersCol.findOne({
      $or: [
        { email: 'careers@sportslet.in' },
        { companyName: 'Sportslet' }
      ]
    });

    if (!sportsletBrand) {
      console.log('Creating Sportslet Brand user...');
      const insertResult = await usersCol.insertOne({
        firstName: 'Sportslet',
        lastName: 'India',
        email: 'careers@sportslet.in',
        role: 'brand',
        companyName: 'Sportslet',
        bio: 'Sportslet is a curated sports e-commerce and retail destination bringing together leading sports brands for players across India, with a focus on racquet sports.',
        serviceNeeded: 'Badminton Content Creation, Instagram Reels, Short-Form Videos, Sports Marketing',
        brandLink: 'https://sportslet.in',
        avatar: '🏸',
        isApproved: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      sportsletBrand = await usersCol.findOne({ _id: insertResult.insertedId });
      console.log('✅ Sportslet Brand created with ID:', sportsletBrand._id);
    } else {
      console.log('Found existing Sportslet Brand:', sportsletBrand._id);
      await usersCol.updateOne(
        { _id: sportsletBrand._id },
        {
          $set: {
            companyName: 'Sportslet',
            bio: 'Sportslet is a curated sports e-commerce and retail destination bringing together leading sports brands for players across India, with a focus on racquet sports.',
            serviceNeeded: 'Badminton Content Creation, Instagram Reels, Short-Form Videos, Sports Marketing',
            brandLink: 'https://sportslet.in',
            avatar: '🏸',
            isApproved: true,
            isVerified: true
          }
        }
      );
    }

    const fullDescription = `About Sportslet
Sportslet is a curated sports e-commerce and retail destination bringing together leading sports brands for players across India, with a focus on racquet sports.

About the Opportunity
Sportslet is looking for a creative, confident college student who is passionate about badminton and content creation.

The selected candidate will create engaging badminton-focused content, work closely with the Sportslet marketing team, and get the opportunity to build both their content portfolio and personal brand.

What You'll Do
• Create content around badminton and the sports world
• Create product reviews and informative videos
• Cover badminton news, trends and topics
• Write scripts, shoot and edit short-form videos
• Create 2–3 social-media-ready videos per week
• Adapt trending formats for a badminton audience
• Appear on camera and become a content voice for Sportslet

Requirements
• College student passionate about badminton/sports
• Comfortable and confident on camera
• Strong communication skills
• Able to write, shoot and edit videos end-to-end
• Familiar with Instagram Reels/short-form content
• Previous content samples or an active Instagram account preferred
• Basic phone camera setup is sufficient (mic/lights are a plus)
• Fluent spoken English preferred; Hindi is a plus

💰 Compensation & Duration
• ₹10,000–₹15,000/month
• Part-time: approx. 10–12 hours/week
• 3-month probation/internship period
• Performance and continuation may be discussed based on the internship/probation period

🎯 What You Get
• Hands-on experience with a growing sports brand
• Real-world content creation experience
• Portfolio-building opportunity
• Exposure to sports marketing
• Opportunity to build your personal brand
• Work directly with an experienced marketing team

How to Apply
• Submit your best video/content sample, preferably related to badminton or sports.
• You may also submit a recent video where you appear on camera and demonstrate your communication and content-creation skills.`;

    const jobData = {
      brandId: sportsletBrand._id,
      brandName: 'Sportslet',
      title: '🏸 Content Creator – Badminton',
      description: fullDescription,
      budget: '₹10,000–₹15,000/month',
      category: 'video',
      categoryPath: 'Opportunity → Internship → Content Creation → Sports',
      roleType: 'Part-time Internship / Opportunity',
      duration: '3 Months',
      timeCommitment: 'Approx. 10–12 hours/week',
      compensation: '₹10,000–₹15,000/month',
      ico: '🏸',
      tags: [
        'Internship',
        'Content Creation',
        'Sports',
        'Badminton',
        '10-12 hrs/wk',
        '₹10k–15k/mo',
        'Reels',
        'Remote'
      ],
      applicationQuestions: [
        'Submit your best video/content sample, preferably related to badminton or sports (Google Drive / link).',
        'Submit a recent video where you appear on camera demonstrating communication and content-creation skills.',
        'Can you commit approx. 10–12 hours/week for this 3-month remote internship (₹10,000–₹15,000/month)?'
      ],
      deadline: '3 Months (Part-time)',
      status: 'open',
      updatedAt: new Date()
    };

    // 2. Check if job already exists or insert
    const existingJob = await jobsCol.findOne({
      brandId: sportsletBrand._id,
      title: { $regex: /Content Creator.*Badminton/i }
    });

    if (existingJob) {
      console.log('Updating existing Job:', existingJob._id);
      await jobsCol.updateOne(
        { _id: existingJob._id },
        { $set: jobData }
      );
      console.log('✅ Job updated successfully!');
    } else {
      console.log('Inserting new Job...');
      jobData.createdAt = new Date();
      const insertJobRes = await jobsCol.insertOne(jobData);
      console.log('✅ Job created with ID:', insertJobRes.insertedId);
    }

    // 3. Long Term Role insertion / update
    const roleData = {
      brandId: sportsletBrand._id,
      brandName: 'Sportslet',
      managerName: 'Sportslet Marketing Team',
      email: 'careers@sportslet.in',
      whatsapp: '',
      roleTitle: '🏸 Content Creator – Badminton (Internship)',
      skillsNeeded: [
        'Content Creation',
        'Badminton',
        'Instagram Reels',
        'Video Editing',
        'Sports'
      ],
      monthlyBudget: '₹10,000–₹15,000/month',
      duration: '3 Months',
      workType: 'remote',
      hoursPerWeek: 'Approx. 10–12 hours/week',
      expectedWeeklyOutput: '2–3 social-media-ready videos per week, product reviews, badminton news and trends',
      trialTask: 'Submit your best video/content sample related to badminton/sports or on-camera video.',
      trialPay: 'Included in monthly stipend',
      startTimeline: 'Immediate / Within 7 days',
      status: 'open',
      adminNotes: 'Category: Opportunity → Internship → Content Creation → Sports',
      updatedAt: new Date()
    };

    const existingRole = await rolesCol.findOne({
      brandId: sportsletBrand._id,
      roleTitle: { $regex: /Content Creator.*Badminton/i }
    });

    if (existingRole) {
      console.log('Updating existing LongTermRole:', existingRole._id);
      await rolesCol.updateOne(
        { _id: existingRole._id },
        { $set: roleData }
      );
      console.log('✅ LongTermRole updated successfully!');
    } else {
      console.log('Inserting new LongTermRole...');
      roleData.createdAt = new Date();
      const insertRoleRes = await rolesCol.insertOne(roleData);
      console.log('✅ LongTermRole created with ID:', insertRoleRes.insertedId);
    }

    console.log('\n🎉 ALL DONE! Opportunity successfully added to NextGenGrowth.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

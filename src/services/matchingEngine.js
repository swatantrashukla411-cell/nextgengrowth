const SKILL_CATEGORY_ALIASES = {
  "video editing": ["video editing", "video editor", "video", "editing", "editor", "reels", "premiere pro", "premiere", "after effects", "capcut", "davinci", "motion graphics", "shorts", "youtube editing"],
  "graphic design": ["graphic design", "graphic designer", "graphic", "design", "designer", "photoshop", "illustrator", "canva", "ui/ux", "figma", "logo design", "logo", "branding", "thumbnail"],
  "content writing": ["content writing", "content writer", "content", "writing", "writer", "copywriting", "copywriter", "blog writing", "blog", "scriptwriting", "script"],
  "web development": ["web development", "web developer", "web dev", "developer", "frontend", "backend", "fullstack", "react", "coding", "software", "wordpress", "html", "javascript", "css"],
  "social media": ["social media", "social media management", "social media manager", "instagram management", "community manager"],
  marketing: ["marketing", "digital marketing", "performance marketing", "growth marketing", "lead generation", "seo", "meta ads", "google ads"],
  audio: ["audio editing", "audio", "music", "podcast", "sound design", "voiceover"],
  "ai tools": ["ai tools", "ai specialist", "prompt engineering", "chatgpt", "midjourney", "ai automation"],
  "data & excel": ["data analysis", "data analytics", "excel", "power bi", "data entry"],
};

function createMatchingEngine({ User, sendConfiguredEmail, opportunityAlertEmail, logger = console }) {
  async function findMatchingStudentsForOpportunity(opp) {
    const oppCategory = String(opp.category || "").toLowerCase().trim();
    const oppTitle = String(opp.title || opp.roleTitle || "").toLowerCase().trim();
    const oppTags = (opp.tags || []).map((tag) => String(tag).toLowerCase().trim()).filter(Boolean);
    const oppSkills = (opp.skillsNeeded || []).map((skill) => String(skill).toLowerCase().trim()).filter(Boolean);
    const targetKeywords = new Set();

    for (const [groupName, keywords] of Object.entries(SKILL_CATEGORY_ALIASES)) {
      const groupMatched = oppCategory.includes(groupName)
        || groupName.includes(oppCategory)
        || keywords.some((keyword) => (keyword.length >= 4 && oppTitle.includes(keyword)) || oppTags.includes(keyword) || oppSkills.includes(keyword));
      if (groupMatched) keywords.forEach((keyword) => targetKeywords.add(keyword));
    }

    if (oppCategory && oppCategory.length >= 3) targetKeywords.add(oppCategory);
    oppTags.forEach((tag) => { if (tag.length >= 3) targetKeywords.add(tag); });
    oppSkills.forEach((skill) => { if (skill.length >= 3) targetKeywords.add(skill); });
    const keywordArr = Array.from(targetKeywords).filter((keyword) => keyword && keyword.length >= 3);
    if (!keywordArr.length) return [];

    const students = await User.find({ role: "student" }).select("firstName lastName email skills headline bio").lean();
    return students.filter((student) => {
      if (!student.email) return false;
      const skills = (student.skills || [])
        .map((skill) => String(skill).toLowerCase().replace(/[^\w\s]/gi, " ").replace(/\s+/g, " ").trim())
        .filter((skill) => skill && skill.length >= 3);
      const headline = String(student.headline || "").toLowerCase().trim();
      const bio = String(student.bio || "").toLowerCase().trim();
      const hasSkillMatch = skills.some((skill) => keywordArr.some((keyword) => skill.includes(keyword) || keyword.includes(skill)));
      const hasHeadlineMatch = keywordArr.some((keyword) => keyword.length >= 4 && (headline.includes(keyword) || (keyword.length >= 6 && bio.includes(keyword))));
      return hasSkillMatch || hasHeadlineMatch;
    });
  }

  async function sendAlerts(opp, students, subject, label) {
    if (!students.length) {
      logger.info(`No matching students found for ${label}.`);
      return;
    }
    for (const student of students) {
      const html = opportunityAlertEmail(student.firstName || "Student", opp);
      sendConfiguredEmail("opportunity", student.email, subject, html)
        .catch((err) => logger.error(`Opportunity alert email failed: ${err.message}`));
    }
    logger.info(`Queued ${students.length} ${label} alerts.`);
  }

  async function notifyMatchingStudentsNewProject(job, brandName) {
    try {
      const opp = {
        type: "project", id: job._id, title: job.title, description: job.description,
        budget: job.budget, category: job.category, tags: job.tags || [], deadline: job.deadline,
        brandName: brandName || job.brandName || "Verified Brand",
      };
      const students = await findMatchingStudentsForOpportunity(opp);
      await sendAlerts(opp, students, `🔥 New Opportunity: "${job.title}" (₹${job.budget}) — Apply before spots fill up!`, `project "${job.title}"`);
    } catch (err) {
      logger.error("Opportunity notification error:", err.message);
    }
  }

  async function notifyMatchingStudentsNewRole(role, brandName) {
    try {
      const opp = {
        type: "role", id: role._id, title: role.roleTitle,
        description: role.expectedWeeklyOutput || role.trialTask || "",
        monthlyBudget: role.monthlyBudget, duration: role.duration, workType: role.workType,
        skillsNeeded: role.skillsNeeded || [], brandName: brandName || role.brandName || "Verified Brand",
      };
      const students = await findMatchingStudentsForOpportunity(opp);
      await sendAlerts(opp, students, `🔥 New Role Alert: "${role.roleTitle}" (${role.monthlyBudget}) — Apply Now!`, `role "${role.roleTitle}"`);
    } catch (err) {
      logger.error("Role opportunity notification error:", err.message);
    }
  }

  return { findMatchingStudentsForOpportunity, notifyMatchingStudentsNewProject, notifyMatchingStudentsNewRole };
}

module.exports = { createMatchingEngine };

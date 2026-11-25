const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Certificate = require('../models/Certificate');
const adminOnly = require('../middleware/adminAuth');

async function generateUniqueCertId() {
  const year = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const code = Math.floor(1000 + Math.random() * 9000);
    const candidate = `NGG-${year}-${code}`;
    const exists = await Certificate.exists({ certificateId: candidate });
    if (!exists) return candidate;
  }
  return `NGG-${year}-${Date.now().toString().slice(-5)}`;
}

function getPublicSiteUrl(req) {
  const configured = String(process.env.SITE_URL || '').trim().replace(/\/$/, '');
  return configured || `${req.protocol}://${req.get('host')}`;
}

function getLocalUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

// @route   POST /api/certificates
// @desc    Issue a new Certificate or LOR & generate high-res scannable QR code (Admin Only)
router.post('/', adminOnly, async (req, res) => {
  try {
    const {
      type,
      certTitle,
      studentName,
      college,
      role,
      duration,
      projectsCompleted,
      endorsementText,
      skills,
      msmeRegNo,
      issuedBy,
    } = req.body;

    if (!studentName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name and work/role are required.',
      });
    }

    const validTypes = ['experience', 'lor', 'appreciation'];
    const safeType = validTypes.includes(type) ? type : 'appreciation';
    const certificateId = await generateUniqueCertId();

    const cleanSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const certificate = await Certificate.create({
      certificateId,
      type: safeType,
      certTitle: (certTitle || 'CERTIFICATE OF APPRECIATION').trim(),
      studentName: studentName.trim(),
      college: (college || '').trim(),
      role: role.trim(),
      duration: (duration || '').trim(),
      projectsCompleted: Number(projectsCompleted) || 1,
      endorsementText: (endorsementText || '').trim(),
      skills: cleanSkills,
      msmeRegNo: (msmeRegNo || 'UDYAM-UP-48-0068269').trim(),
      issuedBy: (issuedBy || 'Swatantra Shukla').trim(),
    });

    const verifyUrl = `${getPublicSiteUrl(req)}/verify/${certificate.certificateId}`;
    const localVerifyUrl = `${getLocalUrl(req)}/verify/${certificate.certificateId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 1000,
      errorCorrectionLevel: 'H',
      color: { dark: '#043b29', light: '#ffffff' },
    });

    console.log(`📜 Certificate Issued: ${certificate.certificateId} for ${certificate.studentName} (${certificate.role})`);

    return res.status(201).json({
      success: true,
      certificate,
      verifyUrl,
      localVerifyUrl,
      qrDownloadUrl: `/api/certificates/qr/${certificate.certificateId}`,
      qrDataUrl,
    });
  } catch (error) {
    console.error('Certificate Issuance Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to issue certificate.',
    });
  }
});

// @route   GET /api/certificates
// @desc    List recently issued certificates (Admin Only)
router.get('/', adminOnly, async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .sort({ issuedAt: -1 })
      .limit(50)
      .lean();
    return res.json({ success: true, count: certificates.length, certificates });
  } catch (error) {
    console.error('List Certificates Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load certificates.' });
  }
});

// @route   DELETE /api/certificates/:certId
// @desc    Revoke or delete an issued certificate (Admin Only)
router.delete('/:certId', adminOnly, async (req, res) => {
  try {
    const certId = String(req.params.certId || '').trim().toUpperCase();
    const deleted = await Certificate.findOneAndDelete({ certificateId: certId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    return res.json({ success: true, message: `Certificate ${certId} removed.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete certificate.' });
  }
});

// @route   GET /api/certificates/verify/:certId
// @desc    Public verification endpoint for HR / college placement checks
router.get('/verify/:certId', async (req, res) => {
  try {
    const certId = String(req.params.certId || '').trim().toUpperCase();
    const certificate = await Certificate.findOne({ certificateId: certId }).lean();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'No certificate found with this ID.',
      });
    }

    const verifyUrl = `${getPublicSiteUrl(req)}/verify/${certificate.certificateId}`;
    const localVerifyUrl = `${getLocalUrl(req)}/verify/${certificate.certificateId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 600,
      errorCorrectionLevel: 'H',
      color: { dark: '#043b29', light: '#ffffff' },
    });

    return res.json({
      success: true,
      certificate,
      verifyUrl,
      localVerifyUrl,
      qrDownloadUrl: `/api/certificates/qr/${certificate.certificateId}`,
      qrDataUrl,
    });
  } catch (error) {
    console.error('Verify Certificate Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying certificate.',
    });
  }
});

// @route   GET /api/certificates/qr/:certId
// @desc    Download crisp 1000x1000 PNG QR code (Admin Only via header or ?token=)
router.get('/qr/:certId', adminOnly, async (req, res) => {
  try {
    const certId = String(req.params.certId || '').trim().toUpperCase();
    const certificate = await Certificate.findOne({ certificateId: certId }).lean();
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate ID not found.' });
    }

    const verifyUrl = `${getPublicSiteUrl(req)}/verify/${certificate.certificateId}`;
    const pngBuffer = await QRCode.toBuffer(verifyUrl, {
      type: 'png',
      width: 1000,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#043b29', light: '#ffffff' },
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.certificateId}-QR.png"`);
    return res.send(pngBuffer);
  } catch (error) {
    console.error('QR Download Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate QR PNG.' });
  }
});

module.exports = router;

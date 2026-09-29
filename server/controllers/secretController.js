import { customAlphabet } from 'nanoid';
import { SecretRepository } from '../models/Secret.js';

const generateShortId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
const generateSenderToken = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-', 32);

// Unopened safety retention: 7 days max if never opened, otherwise burns on 1st view
const SAFETY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * @desc Create a strict view-once encrypted message
 * @route POST /api/secrets
 */
export const createSecret = async (req, res, next) => {
  try {
    const {
      ciphertext,
      iv,
      salt,
      hasPassphrase,
      title = '',
    } = req.body;

    if (!ciphertext || !iv) {
      return res.status(400).json({
        success: false,
        message: 'Invalid encrypted payload. Ciphertext and IV are required.'
      });
    }

    let shortId = generateShortId();
    let exists = await SecretRepository.findByShortId(shortId);
    while (exists) {
      shortId = generateShortId();
      exists = await SecretRepository.findByShortId(shortId);
    }

    const senderToken = generateSenderToken();
    const expiresAt = new Date(Date.now() + SAFETY_TTL_MS);

    // Strictly View-Once: burnAfterReading is ALWAYS true
    const secret = await SecretRepository.create({
      shortId,
      ciphertext,
      iv,
      salt: salt || null,
      hasPassphrase: Boolean(hasPassphrase),
      burnAfterReading: true,
      title: (title || '').trim().slice(0, 150),
      type: 'text',
      language: 'plain',
      expiresAt,
      senderToken
    });

    res.status(201).json({
      success: true,
      data: {
        id: secret.shortId,
        url: `/v/${secret.shortId}`,
        title: secret.title,
        burnAfterReading: true,
        hasPassphrase: secret.hasPassphrase,
        expiresAt: secret.expiresAt,
        createdAt: secret.createdAt,
        senderToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get message status & metadata without revealing or burning
 * @route GET /api/secrets/:id/status
 */
export const getSecretStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const secret = await SecretRepository.findByShortId(id);

    if (!secret) {
      return res.status(404).json({
        success: false,
        exists: false,
        isBurned: true,
        message: 'This message was already viewed and has been permanently destroyed.'
      });
    }

    if (secret.expiresAt && new Date() >= new Date(secret.expiresAt)) {
      await SecretRepository.delete(id);
      return res.status(410).json({
        success: false,
        exists: false,
        isExpired: true,
        message: 'This view-once message expired unopened.'
      });
    }

    res.status(200).json({
      success: true,
      exists: true,
      data: {
        id: secret.shortId,
        title: secret.title || 'View-Once Encrypted Message',
        hasPassphrase: secret.hasPassphrase,
        burnAfterReading: true,
        createdAt: secret.createdAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reveal and burn view-once payload atomically
 * @route POST /api/secrets/:id/reveal
 */
export const revealSecret = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await SecretRepository.revealAndBurn(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        isBurned: true,
        message: 'This message was already viewed and has been permanently incinerated.'
      });
    }

    if (result.isExpired) {
      return res.status(410).json({
        success: false,
        isExpired: true,
        message: 'This message expired unopened.'
      });
    }

    if (result.isBurned && !result.ciphertext) {
      return res.status(410).json({
        success: false,
        isBurned: true,
        message: 'This view-once message has already been viewed and destroyed.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ciphertext: result.ciphertext,
        iv: result.iv,
        salt: result.salt,
        title: result.title,
        hasPassphrase: result.hasPassphrase,
        burnedAt: result.burnedAt || new Date(),
        isBurned: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Sender early manual burn (kill switch)
 * @route DELETE /api/secrets/:id
 */
export const deleteSecret = async (req, res, next) => {
  try {
    const { id } = req.params;
    const token = req.headers['x-sender-token'] || req.query.token;

    const secret = await SecretRepository.findByShortId(id, true);
    if (!secret) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (secret.senderToken && secret.senderToken !== token) {
      return res.status(403).json({ success: false, message: 'Unauthorized cancellation token' });
    }

    await SecretRepository.delete(id);
    res.status(200).json({ success: true, message: 'Message destroyed immediately.' });
  } catch (error) {
    next(error);
  }
};

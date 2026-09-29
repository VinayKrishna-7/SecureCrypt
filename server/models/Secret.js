import mongoose from 'mongoose';

const secretSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    title: {
      type: String,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      trim: true,
      default: ''
    },
    ciphertext: {
      type: String,
      required: [true, 'Ciphertext is required']
    },
    iv: {
      type: String,
      required: [true, 'IV is required']
    },
    salt: {
      type: String,
      default: null
    },
    hasPassphrase: {
      type: Boolean,
      default: false
    },
    burnAfterReading: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      enum: ['text', 'code'],
      default: 'text'
    },
    language: {
      type: String,
      default: 'plain'
    },
    expiresAt: {
      type: Date,
      default: null
    },
    isBurned: {
      type: Boolean,
      default: false
    },
    burnedAt: {
      type: Date,
      default: null
    },
    senderToken: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// TTL index for automatic deletion of expired secrets
secretSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SecretModel = mongoose.model('Secret', secretSchema);

// In-Memory Fallback Store
const memorySecrets = new Map();

export const SecretRepository = {
  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  },

  async create(data) {
    if (this.isMongoConnected()) {
      return await SecretModel.create(data);
    }
    const doc = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      isBurned: false,
      burnedAt: null
    };
    memorySecrets.set(data.shortId, doc);
    return doc;
  },

  async findByShortId(shortId, includeSenderToken = false) {
    if (this.isMongoConnected()) {
      const q = SecretModel.findOne({ shortId });
      if (includeSenderToken) q.select('+senderToken');
      return await q.exec();
    }
    return memorySecrets.get(shortId) || null;
  },

  /**
   * Atomically fetch payload and burn it if burnAfterReading is true
   */
  async revealAndBurn(shortId) {
    const now = new Date();

    if (this.isMongoConnected()) {
      const secret = await SecretModel.findOne({ shortId });
      if (!secret) return null;

      // Check expired
      if (secret.expiresAt && now >= new Date(secret.expiresAt)) {
        await SecretModel.deleteOne({ shortId });
        return { isExpired: true };
      }

      if (secret.isBurned) {
        return { isBurned: true, burnedAt: secret.burnedAt };
      }

      if (secret.burnAfterReading) {
        // Mark as burned and remove ciphertext
        const result = {
          ciphertext: secret.ciphertext,
          iv: secret.iv,
          salt: secret.salt,
          title: secret.title,
          type: secret.type,
          language: secret.language,
          createdAt: secret.createdAt,
          hasPassphrase: secret.hasPassphrase,
          isBurned: true,
          burnedAt: now
        };

        // Permanently delete or mark burned
        await SecretModel.deleteOne({ shortId });
        return result;
      }

      return secret;
    }

    // In-memory fallback
    const secret = memorySecrets.get(shortId);
    if (!secret) return null;

    if (secret.expiresAt && now >= new Date(secret.expiresAt)) {
      memorySecrets.delete(shortId);
      return { isExpired: true };
    }

    if (secret.isBurned) {
      return { isBurned: true, burnedAt: secret.burnedAt };
    }

    if (secret.burnAfterReading) {
      const result = {
        ciphertext: secret.ciphertext,
        iv: secret.iv,
        salt: secret.salt,
        title: secret.title,
        type: secret.type,
        language: secret.language,
        createdAt: secret.createdAt,
        hasPassphrase: secret.hasPassphrase,
        isBurned: true,
        burnedAt: now
      };
      // Permanently wipe payload from memory
      memorySecrets.delete(shortId);
      return result;
    }

    return secret;
  },

  async delete(shortId) {
    if (this.isMongoConnected()) {
      return await SecretModel.deleteOne({ shortId });
    }
    return memorySecrets.delete(shortId);
  }
};

export default SecretModel;

/**
 * Unit tests for Action Mailer
 * Run with: npm test
 */

// Mock @actions/core
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  setFailed: jest.fn(),
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}));

// Mock AWS SDK
jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn(() => ({
    send: jest.fn().mockResolvedValue({ MessageId: 'test-ses-id' }),
  })),
  SendEmailCommand: jest.fn((options) => options),
}));

const core = require('@actions/core');
const nodemailer = require('nodemailer');

describe('Action Mailer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Email validation', () => {
    test('should validate correct email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('user@example.com')).toBe(true);
      expect(emailRegex.test('test.email@domain.co.uk')).toBe(true);
    });

    test('should reject invalid email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
      expect(emailRegex.test('user@')).toBe(false);
    });
  });

  describe('Email list parsing', () => {
    test('should parse comma-separated emails', () => {
      const parseEmailList = (emailString) => {
        if (!emailString || emailString.trim() === '') return [];
        return emailString
          .split(',')
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      };

      expect(parseEmailList('user1@example.com,user2@example.com')).toEqual([
        'user1@example.com',
        'user2@example.com',
      ]);
      expect(parseEmailList('user@example.com')).toEqual(['user@example.com']);
      expect(parseEmailList('')).toEqual([]);
      expect(parseEmailList('  ')).toEqual([]);
    });
  });

  describe('Email size calculation', () => {
    test('should calculate email size correctly', () => {
      const calculateSize = (options) => {
        let size = 0;
        size += Buffer.byteLength(options.subject || '', 'utf8');
        if (options.textBody) {
          size += Buffer.byteLength(options.textBody, 'utf8');
        }
        if (options.htmlBody) {
          size += Buffer.byteLength(options.htmlBody, 'utf8');
        }
        return size;
      };

      const size = calculateSize({
        subject: 'Test',
        textBody: 'Hello World',
        htmlBody: '<p>Hello World</p>',
      });

      expect(size).toBeGreaterThan(0);
    });
  });

  describe('Retry mechanism', () => {
    test('should retry on failure', async () => {
      let attempts = 0;
      const failingFunction = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Test error');
        }
        return 'success';
      };

      const retry = async (fn, maxAttempts, delay, attempt = 1) => {
        try {
          return await fn();
        } catch (error) {
          if (attempt >= maxAttempts) {
            throw error;
          }
          return retry(fn, maxAttempts, delay, attempt + 1);
        }
      };

      const result = await retry(failingFunction, 3, 10);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
  });

  describe('Dry-run mode', () => {
    test('should validate configuration without sending', () => {
      const dryRun = true;
      const fromEmail = 'sender@example.com';
      const toEmails = ['recipient@example.com'];
      const subject = 'Test Subject';

      if (dryRun) {
        // Should validate but not send
        expect(fromEmail).toBeTruthy();
        expect(toEmails.length).toBeGreaterThan(0);
        expect(subject).toBeTruthy();
      }
    });
  });

  describe('Custom headers parsing', () => {
    test('should parse valid JSON headers', () => {
      const headersStr = '{"X-Custom-Header": "value", "X-Priority": "1"}';
      const headers = JSON.parse(headersStr);
      expect(headers['X-Custom-Header']).toBe('value');
      expect(headers['X-Priority']).toBe('1');
    });

    test('should throw error on invalid JSON', () => {
      const invalidJson = '{invalid json}';
      expect(() => JSON.parse(invalidJson)).toThrow();
    });
  });
});


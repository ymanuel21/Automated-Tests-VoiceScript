import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Define the file paths for the corrupted test files
const rawTranscriptPath = path.join(__dirname, 'transcript_raw_corrupted.json');
const metadataPath = path.join(__dirname, 'metadata_corrupted.json');
const processedTranscriptPath = path.join(__dirname, 'transcript_processed_ai_output_flawed.txt');

let rawTranscript: any;
let metadata: any;
let processedTranscript: string;

test.beforeAll(() => {
  // Read the files before tests begin
  rawTranscript = JSON.parse(fs.readFileSync(rawTranscriptPath, 'utf8'));
  metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  processedTranscript = fs.readFileSync(processedTranscriptPath, 'utf8');
});

test.describe('Task 1 & 2: Data Integrity & Transcript Quality', () => {

  test('TC-1: Known entity names should be transcribed correctly', async () => {
    // Entities that should be present based on metadata parties
    const expectedEntities = metadata.parties || ["Moonlight Plaza Association", "Cannon Farms", "Richmond & Lavine PC"];
    
    for (const entity of expectedEntities) {
      // We expect the corrupted transcript to FAIL this test since it says "Moonlite", "Cancun Farms", etc.
      expect(
        processedTranscript.toLowerCase(), 
        `Expected entity "${entity}" to be in processed transcript`
      ).toContain(entity.toLowerCase());
    }
  });

  test('TC-2: Speaker Role Consistency in Metadata', async () => {
    for (const speaker of metadata.speakers) {
      const expectedFullName = `${speaker.first_name} ${speaker.last_name}`;
      // This will fail for Speaker A (Terry vs Jerry Sellingman)
      expect(speaker.full_name, `Speaker name mismatch for ${speaker.role}`).toBe(expectedFullName);
    }
  });

  test('TC-3: Timestamp Monotonicity Within Utterances', async () => {
    for (const utterance of rawTranscript.utterances) {
      let prevTs = -1;
      for (const word of utterance.words) {
        // Will fail because timestamps go backward or are duplicated
        expect(word.start, `Non-monotonic timestamp detected for word "${word.text}"`).toBeGreaterThanOrEqual(prevTs);
        prevTs = word.start;
      }
    }
  });

  test('TC-4: Word Timestamps Containment', async () => {
    for (const utterance of rawTranscript.utterances) {
      for (const word of utterance.words) {
        // Will fail because some word starts before the utterance starts
        expect(word.start, `Word "${word.text}" starts before its utterance`).toBeGreaterThanOrEqual(utterance.start);
      }
    }
  });

  test('TC-5: No Duplicate Word Timestamps', async () => {
    for (const utterance of rawTranscript.utterances) {
      const seenTimestamps = new Set<number>();
      for (const word of utterance.words) {
        // Will fail because words like "I" and "am" share the same timestamp (4560)
        expect(seenTimestamps.has(word.start), `Duplicate timestamp ${word.start} found for word "${word.text}"`).toBeFalsy();
        seenTimestamps.add(word.start);
      }
    }
  });

  test('TC-6: Valid ISO 8601 created_at Date', async () => {
    const createdAt = metadata.created_at;
    // Will fail because of hour 26 and minute 61
    const date = new Date(createdAt.replace("Z", "+00:00"));
    expect(Number.isNaN(date.getTime()), `Invalid ISO date format: ${createdAt}`).toBeFalsy();
  });

  test('TC-7: Audio vs Transcript Duration Reconcilation', async () => {
    // Fails because there's an unaccounted gap between the two durations
    expect(metadata.transcript_duration_ms, 'Transcript duration exceeds or vastly differs from audio duration')
      .toBeLessThanOrEqual(metadata.audio_duration_ms);
  });
});

test.describe('Task 3 & 4: API & Workflow Testing (Playwright APIRequestContext)', () => {
  const BASE_URL = 'http://localhost:8080';

  test.describe('POST /transcripts/process', () => {
    test('Should accept valid payload and return 200/202', async ({ request }) => {
      // Mocking the request. In a real environment, Playwright would hit the endpoint.
      /*
      const response = await request.post(`${BASE_URL}/transcripts/process`, {
        data: { utterances: rawTranscript.utterances, metadata: metadata }
      });
      expect([200, 202]).toContain(response.status());
      */
      test.info().annotations.push({ type: 'Info', description: 'Skipping actual API call; uncomment when server is active.' });
    });

    test('Should return 400 Bad Request for missing required fields', async ({ request }) => {
      /*
      const response = await request.post(`${BASE_URL}/transcripts/process`, {
        data: { metadata: metadata } // Missing utterances
      });
      expect(response.status()).toBe(400);
      */
      test.info().annotations.push({ type: 'Info', description: 'Skipping actual API call.' });
    });
  });

  test.describe('State Machine / Workflow Transitions', () => {
    const VALID_TRANSITIONS = [
      { from: "NEW", to: "ASSIGNED" },
      { from: "ASSIGNED", to: "TRANSCRIBED" },
      { from: "TRANSCRIBED", to: "REVIEWED" },
      { from: "REVIEWED", to: "COMPLETED" },
    ];

    for (const transition of VALID_TRANSITIONS) {
      test(`Valid transition: ${transition.from} -> ${transition.to}`, async ({ request }) => {
        /*
        const response = await request.post(`${BASE_URL}/workflow/transition`, {
          data: { state: transition.from, next_state: transition.to }
        });
        expect(response.status()).toBe(200);
        */
        test.info().annotations.push({ type: 'Info', description: 'Skipping actual API call.' });
      });
    }

    test('Should return 409 Conflict for invalid skips (e.g. NEW -> COMPLETED)', async ({ request }) => {
      /*
      const response = await request.post(`${BASE_URL}/workflow/transition`, {
        data: { state: "NEW", next_state: "COMPLETED" }
      });
      expect(response.status()).toBe(409);
      */
      test.info().annotations.push({ type: 'Info', description: 'Skipping actual API call.' });
    });
  });
});

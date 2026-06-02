# QA Engineer Assessment Files — Moonlight Plaza

You are given three files:

1. `transcript_raw_corrupted.json` — raw ASR-style transcript output with word timestamps.
2. `transcript_processed_ai_output_flawed.txt` — a processed transcript produced by a hypothetical AI cleanup system.
3. `metadata_corrupted.json` — metadata extracted from the proceeding.

Use these files to complete the QA Engineer Assessment.

## Your tasks

Review the transcript and metadata and produce:

1. At least 10 issues, including transcription errors, formatting problems, speaker attribution issues, and timestamp inconsistencies.
2. At least 8 test cases that would catch these issues.
3. A testing plan for:
   - `POST /transcripts/process`
   - `GET /transcripts/:id`
4. Workflow tests for:
   - `NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED`
5. A proposed automation approach.

## Notes

Some issues are obvious and some are subtle. We are interested in your ability to reason about transcript quality, metadata consistency, speaker attribution, timestamps, API behavior, and workflow state transitions.

## How to Run the Automated Tests

An automated testing suite using Playwright has been provided to programmatically detect the issues outlined in the QA response. 

To execute the test script:

1. Open a terminal in this directory (`File Folder`).
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the tests:
   ```bash
   npm test
   ```
   *(Note: 6 tests will intentionally FAIL. This proves the logic successfully caught the corrupted data!)*
4. To view the detailed HTML report of the test run, execute:
   ```bash
   npx playwright show-report
   ```
   *(This command will automatically spin up a local web server, typically at `http://localhost:9323`, and open the beautiful HTML test results directly in your web browser!)*

## Version Control Best Practices

Please note that following standard software engineering best practices, a `.gitignore` file is included in this repository. The following directories are intentionally excluded from version control:

* **`node_modules/`**: Contains large external dependency files for Playwright. This folder is generated locally when you run `npm install` and should not be tracked in Git.
* **`playwright-report/` & `test-results/`**: These folders contain the HTML test reports and trace files. Because these are output artifacts that are generated brand new every time the tests run, they are excluded from source control.

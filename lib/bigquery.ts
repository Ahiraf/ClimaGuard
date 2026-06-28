import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  // On Cloud Run, uses the service account automatically (no key file needed)
  // For local dev, set GOOGLE_APPLICATION_CREDENTIALS env var
});

const DATASET = "climaguard";
const TABLE = "risk_events";

export async function logRiskEvent(event: {
  lat: number;
  lon: number;
  country: string;
  riskLevel: string;
  hazards: string[];
  temperature: number;
  childAge: string;
  language: string;
}) {
  try {
    await bigquery.dataset(DATASET).table(TABLE).insert([{
      ...event,
      hazards: event.hazards.join(","),
      timestamp: new Date().toISOString(),
    }]);
  } catch {
    // Non-critical — don't fail the request if BigQuery logging fails
  }
}

export async function createDatasetAndTable() {
  try {
    const [datasets] = await bigquery.getDatasets();
    const exists = datasets.some(d => d.id === DATASET);
    if (!exists) await bigquery.createDataset(DATASET);

    const dataset = bigquery.dataset(DATASET);
    const [tables] = await dataset.getTables();
    const tableExists = tables.some(t => t.id === TABLE);
    if (!tableExists) {
      await dataset.createTable(TABLE, {
        schema: {
          fields: [
            { name: "lat", type: "FLOAT" },
            { name: "lon", type: "FLOAT" },
            { name: "country", type: "STRING" },
            { name: "riskLevel", type: "STRING" },
            { name: "hazards", type: "STRING" },
            { name: "temperature", type: "FLOAT" },
            { name: "childAge", type: "STRING" },
            { name: "language", type: "STRING" },
            { name: "timestamp", type: "TIMESTAMP" },
          ],
        },
      });
    }
  } catch {
    // Setup failure is non-critical
  }
}

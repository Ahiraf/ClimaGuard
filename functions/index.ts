import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

async function fetchWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code&daily=precipitation_sum&timezone=auto`;
  const res = await fetch(url);
  return res.json();
}

function getRiskFromWeather(temp: number, precip: number, weatherCode: number): string {
  if (weatherCode >= 95 || precip > 20) return "CRITICAL";
  if (temp >= 38 || precip > 10 || weatherCode >= 80) return "HIGH";
  if (temp >= 35 || precip > 3) return "MEDIUM";
  return "LOW";
}

// Runs every day at 7 AM UTC
export const dailyRiskAlerts = functions.scheduler.onSchedule({
  schedule: "0 7 * * *",
  timeZone: "UTC",
}, async () => {
  const usersSnap = await db.collection("users").get();

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const { fcmToken, childName, childAge, countryCode } = userData;
    if (!fcmToken) continue;

    // Get the user's most recent report to find their location
    const reportsSnap = await db.collection("reports")
      .where("userId", "==", userDoc.id)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (reportsSnap.empty) continue;
    const lastReport = reportsSnap.docs[0].data();
    const { lat, lon, country } = lastReport;

    try {
      const weather = await fetchWeather(lat, lon);
      const temp = weather.current?.temperature_2m ?? 30;
      const precip = weather.current?.precipitation ?? 0;
      const code = weather.current?.weather_code ?? 0;
      const risk = getRiskFromWeather(temp, precip, code);

      if (risk === "LOW") continue; // Only alert for MEDIUM and above

      const emoji = risk === "CRITICAL" ? "🚨" : risk === "HIGH" ? "⚠️" : "⚡";
      const name = childName || "Your child";
      const age = childAge ? ` (age ${childAge})` : "";

      await messaging.send({
        token: fcmToken,
        notification: {
          title: `${emoji} ClimaGuard: ${risk} Risk Alert`,
          body: `${name}${age} in ${country} — ${temp}°C, ${precip}mm rain. Open app for safety guidance.`,
        },
        data: {
          riskLevel: risk,
          country: country,
          lat: String(lat),
          lon: String(lon),
          countryCode: countryCode || "",
          childAge: childAge || "5",
        },
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default", badge: 1 } } },
      });
    } catch (err) {
      console.error(`Alert failed for user ${userDoc.id}:`, err);
    }
  }

  console.log(`Daily alerts processed for ${usersSnap.size} users`);
});

// Triggered when a new report with CRITICAL risk is saved — immediate alert
export const criticalRiskAlert = functions.firestore.onDocumentCreated(
  "reports/{reportId}",
  async (event) => {
    const report = event.data?.data();
    if (!report || report.overallRisk !== "CRITICAL") return;

    const userDoc = await db.collection("users").doc(report.userId).get();
    const userData = userDoc.data();
    if (!userData?.fcmToken) return;

    await messaging.send({
      token: userData.fcmToken,
      notification: {
        title: "🚨 CRITICAL Climate Risk Detected",
        body: `Immediate danger in ${report.country}. Open ClimaGuard now for emergency guidance.`,
      },
      data: { riskLevel: "CRITICAL", country: report.country },
      android: { priority: "high" },
    });
  }
);

importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

// These values are replaced at build time or configured here directly
// since service workers can't access Next.js env vars
firebase.initializeApp({
  apiKey: self.__FIREBASE_API_KEY__,
  authDomain: self.__FIREBASE_AUTH_DOMAIN__,
  projectId: self.__FIREBASE_PROJECT_ID__,
  storageBucket: self.__FIREBASE_STORAGE_BUCKET__,
  messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__,
  appId: self.__FIREBASE_APP_ID__,
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const riskLevel = payload.data?.riskLevel || "MEDIUM";
  const icon = riskLevel === "CRITICAL" ? "/icons/icon-critical.png" : "/icons/icon-192x192.png";

  self.registration.showNotification(title || "ClimaGuard Alert", {
    body: body || "Check climate risk for your child.",
    icon,
    badge: "/icons/icon-72x72.png",
    tag: "climaguard-alert",
    renotify: true,
    data: payload.data,
    actions: [
      { action: "open", title: "View Report" },
      { action: "dismiss", title: "Dismiss" },
    ],
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "open" || !event.action) {
    const country = event.notification.data?.countryCode || "";
    const age = event.notification.data?.childAge || "5";
    event.waitUntil(
      clients.openWindow(`/dashboard?country=${country}&age=${age}`)
    );
  }
});

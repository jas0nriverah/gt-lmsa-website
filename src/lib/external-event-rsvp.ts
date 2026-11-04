const externalEventRsvpUrls: Readonly<Record<string, string>> = {
  "363cf802-17ba-4563-9be6-69674c835473": "https://forms.gle/rThB7VNx7ozuWWNQ6",
};

export function externalEventRsvpUrl(eventId: string): string | null {
  return externalEventRsvpUrls[eventId] ?? null;
}

export interface CalendarEventData {
	id?: string;
	title?: string;
	description?: string | null;
	startDate?: string | Date | null;
	endDate?: string | Date | null;
	startTime?: string | null;
	endTime?: string | null;
	venue?: string | null;
	location?: string | null;
}

const DEFAULT_DURATION_MS = 60 * 60 * 1000;

const pad2 = (value: number) => value.toString().padStart(2, "0");

const getDateParts = (dateValue?: string | Date | null) => {
	if (!dateValue) return null;

	if (dateValue instanceof Date) {
		if (Number.isNaN(dateValue.getTime())) return null;
		return {
			year: dateValue.getFullYear(),
			month: dateValue.getMonth(),
			day: dateValue.getDate(),
		};
	}

	const dateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateValue);
	if (dateMatch) {
		return {
			year: Number.parseInt(dateMatch[1], 10),
			month: Number.parseInt(dateMatch[2], 10) - 1,
			day: Number.parseInt(dateMatch[3], 10),
		};
	}

	const parsed = new Date(dateValue);
	if (Number.isNaN(parsed.getTime())) return null;
	return {
		year: parsed.getFullYear(),
		month: parsed.getMonth(),
		day: parsed.getDate(),
	};
};

const parseTimeParts = (timeValue?: string | null, fallbackHour = 9, fallbackMinute = 0) => {
	if (!timeValue) {
		return { hour: fallbackHour, minute: fallbackMinute };
	}

	const [hours, minutes] = timeValue.split(":");
	const hour = Number.parseInt(hours, 10);
	const minute = Number.parseInt(minutes || "0", 10);

	if (Number.isNaN(hour) || hour < 0 || hour > 23) {
		return { hour: fallbackHour, minute: fallbackMinute };
	}

	if (Number.isNaN(minute) || minute < 0 || minute > 59) {
		return { hour, minute: fallbackMinute };
	}

	return { hour, minute };
};

const combineDateAndTime = (
	dateValue?: string | Date | null,
	timeValue?: string | null,
	fallbackHour = 9,
	fallbackMinute = 0
) => {
	const dateParts = getDateParts(dateValue);
	if (!dateParts) return null;

	const { hour, minute } = parseTimeParts(timeValue, fallbackHour, fallbackMinute);
	return new Date(dateParts.year, dateParts.month, dateParts.day, hour, minute, 0, 0);
};

const toUtcCalendarString = (date: Date) => {
	return (
		`${date.getUTCFullYear()}` +
		`${pad2(date.getUTCMonth() + 1)}` +
		`${pad2(date.getUTCDate())}` +
		`T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`
	);
};

const sanitizeIcsText = (value: string) => {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/\n/g, "\\n")
		.replace(/,/g, "\\,")
		.replace(/;/g, "\\;");
};

const getEventLocation = (event: CalendarEventData) => {
	const venue = event.venue?.trim();
	const location = event.location?.trim();
	return [venue, location].filter(Boolean).join(", ") || "Location TBA";
};

const buildDateRange = (event: CalendarEventData) => {
	const start = combineDateAndTime(event.startDate, event.startTime);
	if (!start) return null;

	const end = combineDateAndTime(
		event.endDate || event.startDate,
		event.endTime || event.startTime,
		start.getHours(),
		start.getMinutes()
	);

	if (!end || end <= start) {
		return {
			start,
			end: new Date(start.getTime() + DEFAULT_DURATION_MS),
		};
	}

	return { start, end };
};

const getEventDetailsText = (event: CalendarEventData, eventUrl?: string) => {
	const details = event.description?.trim() || "";
	if (!eventUrl) return details;
	return [details, `Event page: ${eventUrl}`].filter(Boolean).join("\n\n");
};

export const buildGoogleCalendarUrl = (event: CalendarEventData, eventUrl?: string) => {
	const range = buildDateRange(event);
	if (!range) return null;

	const params = new URLSearchParams({
		action: "TEMPLATE",
		text: event.title || "Chicago Nigeria Event",
		dates: `${toUtcCalendarString(range.start)}/${toUtcCalendarString(range.end)}`,
		details: getEventDetailsText(event, eventUrl),
		location: getEventLocation(event),
	});

	return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const downloadCalendarInvite = (event: CalendarEventData, eventUrl?: string) => {
	if (typeof window === "undefined" || typeof document === "undefined") return false;

	const range = buildDateRange(event);
	if (!range) return false;

	const nowStamp = toUtcCalendarString(new Date());
	const safeTitle = (event.title || "event").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
	const uidBase = event.id || `${Date.now()}`;
	const uid = `${uidBase}@chicago-nigeria`;
	const details = getEventDetailsText(event, eventUrl);
	const location = getEventLocation(event);

	const icsLines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Chicago Nigeria//Event Registration//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VEVENT",
		`UID:${uid}`,
		`DTSTAMP:${nowStamp}`,
		`DTSTART:${toUtcCalendarString(range.start)}`,
		`DTEND:${toUtcCalendarString(range.end)}`,
		`SUMMARY:${sanitizeIcsText(event.title || "Chicago Nigeria Event")}`,
		`LOCATION:${sanitizeIcsText(location)}`,
		details ? `DESCRIPTION:${sanitizeIcsText(details)}` : "",
		"END:VEVENT",
		"END:VCALENDAR",
	].filter(Boolean);

	const blob = new Blob([icsLines.join("\r\n")], {
		type: "text/calendar;charset=utf-8",
	});
	const downloadUrl = URL.createObjectURL(blob);

	const anchor = document.createElement("a");
	anchor.href = downloadUrl;
	anchor.download = `${safeTitle || "event"}-invite.ics`;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);

	return true;
};

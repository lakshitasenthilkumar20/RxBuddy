def calculate_adherence(intake_records):
    if not intake_records:
        return 0

    taken = sum(1 for r in intake_records if r["status"] == "TAKEN")
    total = len(intake_records)

    return round((taken / total) * 100, 2)


def summarize_safety_alerts(alerts):
    summary = {}

    for alert in alerts:
        key = alert["alert_type"]
        summary[key] = summary.get(key, 0) + 1

    return summary

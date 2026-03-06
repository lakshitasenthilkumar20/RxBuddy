def check_allergies(medicines, user_allergies):
    alerts = []

    # convert allergies to lowercase
    user_allergies = [a.lower() for a in user_allergies]

    for med in medicines:
        med_name = med["name"].lower()

        if med_name in user_allergies:
            alerts.append({
                "medication": med["name"],
                "type": "ALLERGY",
                "severity": "HIGH",
                "message": f"Patient is allergic to {med['name']}"
            })

    return alerts

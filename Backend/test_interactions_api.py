import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000"

def test_safety_check_direct():
    print("\n--- Testing Safety Check Endpoint (Direct Evaluation) ---")
    
    # CASE 1: Drug Interaction Check (Aspirin + Warfarin)
    # Expected: Interaction warning
    meds_interaction = [
        {"name": "Aspirin"},
        {"name": "Warfarin"}
    ]
    
    print("\n1. Testing Public Interaction Check (Aspirin + Warfarin)")
    response = requests.get(f"{BASE_URL}/interactions/check", params=[("drugs", "Aspirin"), ("drugs", "Warfarin")])
    
    if response.status_code == 200:
        results = response.json()
        if len(results) > 0:
            print("✅ SUCCESS: Found interaction:")
            print(f"   {results[0]['description']}")
        else:
            print("❌ FAILURE: No interaction found for Aspirin + Warfarin")
    else:
        print(f"❌ ERROR: Request failed with {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_safety_check_direct()

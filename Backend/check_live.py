
import requests
import sys

def check_live_interaction(drug1, drug2):
    url = "http://127.0.0.1:8000/interactions/check"
    params = [("drugs", drug1), ("drugs", drug2)]
    print(f"Checking interactions for: {drug1} + {drug2}...")
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            interactions = response.json()
            if interactions:
                print(f"FOUND {len(interactions)} INTERACTION(S):")
                for i in interactions:
                    print(f"  - {i['description']}")
            else:
                print("No interactions found.")
        else:
            print(f"API Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Connection Error: {e}")
        print("Make sure the backend server consists of uvicorn is running on port 8000.")

if __name__ == "__main__":
    # Test a pair confirmed to be in the CSV
    # Row from CSV: "Cyclophosphamide,Digoxin,Cyclophosphamide may decrease the cardiotoxic activities of Digoxin."
    check_live_interaction("Cyclophosphamide", "Digoxin")
    
    print("-" * 30)
    
    # Test another one
    # Row: "Paclitaxel,Verteporfin..."
    check_live_interaction("Paclitaxel", "Verteporfin")

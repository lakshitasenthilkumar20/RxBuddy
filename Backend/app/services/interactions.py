
import csv
import os
from typing import List, Dict, Optional

class InteractionService:
    _instance = None
    _interactions_db: Dict[str, List[Dict[str, str]]] = {}
    _loaded = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(InteractionService, cls).__new__(cls)
            cls._instance._interactions_db = {}
            cls._instance._loaded = False
        return cls._instance

    def load_data(self, file_path: str):
        if self._loaded:
            return

        print(f"Loading drug interactions database from {file_path}...")
        if not os.path.exists(file_path):
            print(f"Error: Interaction database file not found at {file_path}")
            return

        try:
            with open(file_path, mode='r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                # Ensure headers are correct: 'Drug 1', 'Drug 2', 'Interaction Description'
                # If headers are different, adjust accordingly.
                # Based on previous check: Drug 1,Drug 2,Interaction Description
                
                count = 0
                for row in reader:
                    # Robustly get keys even if there are spaces or case differences
                    d1 = row.get('Drug 1') or row.get('Drug1')
                    d2 = row.get('Drug 2') or row.get('Drug2')
                    desc = row.get('Interaction Description') or row.get('Description') or row.get('Interaction')

                    if not d1 or not d2:
                        continue
                        
                    drug1 = d1.strip().lower()
                    drug2 = d2.strip().lower()
                    description = desc.strip() if desc else "Interaction detected."

                    # Store forward interaction
                    if drug1 not in self._interactions_db:
                        self._interactions_db[drug1] = []
                    self._interactions_db[drug1].append({"drug": drug2, "description": description})

                    # Store reverse interaction for faster lookup
                    if drug2 not in self._interactions_db:
                        self._interactions_db[drug2] = []
                    self._interactions_db[drug2].append({"drug": drug1, "description": description})
                    
                    count += 1
                    
                print(f"Loaded {count} interaction entries into memory.")
                self._loaded = True
        except Exception as e:
            print(f"Error loading interaction database: {e}")

    def check_interactions(self, drugs: List[str]) -> List[Dict[str, str]]:
        """
        Check for interactions between any pair in the provided list of drugs.
        Returns a list of interactions found.
        """
        found_interactions = []
        drugs_lower = [d.strip().lower() for d in drugs]
        
        # We need to map back to original names for the response?
        # Let's verify interactions using lower case but return original names if possible.
        # Or just return the names as found in DB.
        # To be safe, return the names passed in.
        
        n = len(drugs)
        for i in range(n):
            for j in range(i + 1, n):
                d1_input = drugs[i]
                d2_input = drugs[j]
                d1_lower = drugs_lower[i]
                d2_lower = drugs_lower[j]
                
                if d1_lower in self._interactions_db:
                    # Check if d2_lower is in the list of interactions for d1_lower
                    for entry in self._interactions_db[d1_lower]:
                        if entry['drug'] == d2_lower:
                            found_interactions.append({
                                "drug1": d1_input,
                                "drug2": d2_input,
                                "description": entry['description']
                            })
                            # Assuming only one interaction per pair in the list
                            break
                            
        return found_interactions

    def get_interaction_details(self, drug_name: str) -> List[Dict[str, str]]:
        drug_lower = drug_name.strip().lower()
        return self._interactions_db.get(drug_lower, [])

# Singleton instance
interaction_service = InteractionService()

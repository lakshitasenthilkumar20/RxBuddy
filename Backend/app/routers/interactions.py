
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict
from app.services.interactions import interaction_service

router = APIRouter(
    prefix="/interactions",
    tags=["interactions"],
    responses={404: {"description": "Not found"}},
)

@router.get("/check", response_model=List[Dict[str, str]])
async def check_interactions(drugs: List[str] = Query(..., description="List of drug names to check for interactions")):
    """
    Check for interactions between a list of drugs.
    """
    if not drugs:
        return []
    
    # Ensure all drug names are valid strings
    valid_drugs = [d for d in drugs if d and isinstance(d, str)]
    
    if len(valid_drugs) < 2:
        return []
        
    interactions = interaction_service.check_interactions(valid_drugs)
    return interactions

@router.get("/{drug_name}", response_model=List[Dict[str, str]])
async def get_drug_interactions(drug_name: str):
    """
    Get all known interactions for a specific drug.
    """
    interactions = interaction_service.get_interaction_details(drug_name)
    if not interactions:
        # Instead of 404, maybe return empty list? Or 404 if drug not found in DB at all?
        # A drug might exist but have no known interactions.
        # But if it's not in our DB, we don't know about it.
        # Let's return empty list to be safe.
        return []
    
    # Format for response: include queried drug as 'drug1' and result as 'drug2'?
    # The service returns [{'drug': 'other_drug', 'description': '...'}]
    # We should transform this to be clearer.
    
    result = []
    for interaction in interactions:
        result.append({
            "drug1": drug_name,
            "drug2": interaction['drug'],
            "description": interaction['description']
        })
        
    return result

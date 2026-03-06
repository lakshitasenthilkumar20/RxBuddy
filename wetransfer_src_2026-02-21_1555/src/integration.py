import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import cv2
import numpy as np
import easyocr
import json
import re

class CompleteMedicineExtractor:
    def __init__(self, trocriam1_path=r"C:\prescription_project\trocr_prescription_final_without_iam1"):
        print("🚀 Loading models...")
        self.processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
        self.model = VisionEncoderDecoderModel.from_pretrained(trocriam1_path)
        self.model.eval()
        self.reader = easyocr.Reader(['en'])
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        
        # COMPREHENSIVE MEDICINE DATABASE
        self.medicine_database = self._build_medicine_database()
        
        print(f"✅ Loaded {len(self.medicine_database)} medicines in database")
    
    def _build_medicine_database(self):
        """Comprehensive medicine database with variations"""
        return {
            # Anti-diabetic drugs
            'tolbutamide': ['tolbutamide', 'tolbutamid', 'tolb utamide', 'orinese'],
            'metformin': ['metformin', 'glucophage', 'glycomet', 'metformina'],
            'glibenclamide': ['glibenclamide', 'glyburide', 'daonil'],
            'gliclazide': ['gliclazide', 'diamicron', 'glizide'],
            
            # Pain killers
            'dihydrocodeine': ['dihydrocodeine', 'dihyrocodeine', 'dihydro', 'codeine', 'df-118'],
            'paracetamol': ['paracetamol', 'acetaminophen', 'pcm', 'crocin', 'tylenol', 'dolo'],
            'ibuprofen': ['ibuprofen', 'brufen', 'advil', 'motrin', 'ibugesic'],
            'aspirin': ['aspirin', 'ecosprin', 'disprin', 'aspro'],
            'tramadol': ['tramadol', 'tramazac', 'ultram'],
            
            # Antibiotics
            'amoxicillin': ['amoxicillin', 'amoxil', 'amoxicilline', 'moxicillin'],
            'azithromycin': ['azithromycin', 'azax', 'azithral', 'zithromax'],
            'ciprofloxacin': ['ciprofloxacin', 'cipro', 'ciproxin'],
            'doxycycline': ['doxycycline', 'doxylin', 'vibramycin'],
            'cephalexin': ['cephalexin', 'keflex', 'cephaxin'],
            
            # Cardiac drugs
            'digoxin': ['digoxin', 'dijoxin', 'digoxine', 'lanoxin'],
            'atenolol': ['atenolol', 'tenormin', 'atenol'],
            'amlodipine': ['amlodipine', 'norvasc', 'amlogard'],
            'lisinopril': ['lisinopril', 'zestril', 'prinivil'],
            
            # Stomach medicines
            'omeprazole': ['omeprazole', 'omez', 'prilosec', 'omeprole'],
            'pantoprazole': ['pantoprazole', 'pantocid', 'protonix'],
            'ranitidine': ['ranitidine', 'zantac', 'ranitidin'],
            
            # Eudibene (your specific medicine)
            'eudibene': ['eudibene', 'eudiben', 'eudibene de'],
            
            # Add these from the new prescription
            'betaloc': ['betaloc', 'bet aloc', 'beta loc', 'metoprolol'],
            'dorzolamidum': ['dorzolamidum', 'dorzolamide', 'dorzolamid'],
            'cimetidine': ['cimetidine', 'cimetidin', 'tagamet', 'cinetidine'],
            'oxprelol': ['oxprelol', 'oxprenolol', 'oxprelol', 'oxprelal'],
            'ibuprofen':['IBUPROFEN','Ibuprofen']
        }
    
    def is_medicine(self, text):
        """Advanced medicine detection"""
        if not text or len(text) < 3:
            return None
        
        text_lower = text.lower().strip()
        
        # Direct database match
        for medicine, variations in self.medicine_database.items():
            # Exact match
            if text_lower in variations:
                return medicine.upper()
            
            # Partial match (for merged text)
            for var in variations:
                if var in text_lower or text_lower in var:
                    # Calculate similarity
                    if len(var) > 4 and len(text_lower) > 4:
                        similarity = len(set(text_lower) & set(var)) / len(set(var))
                        if similarity > 0.7:  # 70% similar
                            return medicine.upper()
        
        # Check medicine suffixes
        medicine_suffixes = ['lol', 'idine', 'amide', 'cillin', 'mycin', 
                           'dipine', 'sartan', 'pram', 'done', 'vir']
        
        for suffix in medicine_suffixes:
            if text_lower.endswith(suffix) and len(text_lower) > 4:
                return text.upper()
        
        return None
    
    def extract_dosage(self, text):
        """Extract dosage information"""
        if not text:
            return None
            
        # Look for dosage patterns
        pattern = r'(\d+\.?\d*)\s*(mg|ml|mcg|g|iu)'
        match = re.search(pattern, text.lower())
        if match:
            return f"{match.group(1)}{match.group(2)}"
        return None
    
    def extract_medicines(self, image_path):
        """Extract medicines and dosages - FIXED VERSION"""
        
        print(f"\n🔍 Processing: {image_path}")
        
        # Load image
        image = Image.open(image_path).convert('RGB')
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Detect text regions
        results = self.reader.readtext(image_cv)
        
        medicines = []
        dosages = []
        
        print("\n📝 Analyzing regions...")
        
        # Store all predictions with their vertical position
        all_predictions = []
        
        for i, (bbox, easy_text, easy_conf) in enumerate(results):
            # Get region position (vertical center)
            y_coords = [point[1] for point in bbox]
            y_center = sum(y_coords) / 4
            
            # Get region
            pts = np.array(bbox, dtype=np.int32)
            x, y = pts.min(axis=0)
            x2, y2 = pts.max(axis=0)
            
            # Add padding
            padding = 5
            x = max(0, x - padding)
            y = max(0, y - padding)
            x2 = min(image_cv.shape[1], x2 + padding)
            y2 = min(image_cv.shape[0], y2 + padding)
            
            # Crop region
            region = image_cv[y:y2, x:x2]
            region_rgb = cv2.cvtColor(region, cv2.COLOR_BGR2RGB)
            region_pil = Image.fromarray(region_rgb)
            
            # Run TrOCR
            pixel_values = self.processor(region_pil, return_tensors="pt").pixel_values
            pixel_values = pixel_values.to(self.device)
            
            with torch.no_grad():
                generated_ids = self.model.generate(
                    pixel_values,
                    max_length=50,
                    num_beams=3
                )
                trocr_text = self.processor.decode(generated_ids[0], skip_special_tokens=True)
            
            # Store prediction with position
            all_predictions.append({
                'easyocr': easy_text,
                'trocr': trocr_text,
                'confidence': easy_conf,
                'y_center': y_center,
                'bbox': bbox
            })
        
        # Sort by vertical position (top to bottom)
        all_predictions.sort(key=lambda x: x['y_center'])
        
        # Process in order
        medicine_dosage_map = {}
        
        for pred in all_predictions:
            trocr_text = pred['trocr']
            easy_text = pred['easyocr']
            easy_conf = pred['confidence']
            
            # Check for medicine
            medicine_match = self.is_medicine(trocr_text)
            
            # Check for dosage
            dosage = self.extract_dosage(trocr_text)
            if not dosage:
                dosage = self.extract_dosage(easy_text)
            
            if medicine_match:
                # This is a medicine line
                medicine_dosage_map[medicine_match] = {
                    'name': medicine_match,
                    'original': trocr_text,
                    'confidence': easy_conf * 100,
                    'dosage': dosage,  # Dosage from same line
                    'easyocr': easy_text
                }
                print(f"  ✅ MEDICINE: {medicine_match} (dosage: {dosage}) from '{easy_text}' → '{trocr_text}'")
            
            elif dosage and medicine_dosage_map:
                # This is a dosage line - attach to last medicine
                last_medicine = list(medicine_dosage_map.keys())[-1]
                if not medicine_dosage_map[last_medicine]['dosage']:
                    medicine_dosage_map[last_medicine]['dosage'] = dosage
                    print(f"  💊 Added dosage {dosage} to {last_medicine}")
        
        # Convert to list
        medicines = list(medicine_dosage_map.values())
        
        # Print final results
        print("\n" + "="*70)
        print("📋 FINAL PRESCRIPTION ANALYSIS")
        print("="*70)
        
        if medicines:
            for med in medicines:
                print(f"\n✅ Medicine: {med['name']}")
                print(f"   Detected as: '{med['original']}'")
                print(f"   Confidence: {med['confidence']:.1f}%")
                print(f"   💊 Dosage: {med['dosage'] if med['dosage'] else 'Not detected'}")
        else:
            print("\n❌ No medicines detected")
        
        return {
            'medicines': [m['name'] for m in medicines],
            'details': medicines
        }

# Run it
if __name__ == "__main__":
    extractor = CompleteMedicineExtractor(r"C:\prescription_project\trocr_prescription_final_without_iam1")
    result = extractor.extract_medicines(r"C:\INTERN MODEL\raw_datasets\data\42.jpg")
    
    print(f"\n🎯 Final medicine list: {result['medicines']}")
    
    print("\n📊 SUMMARY:")

# complete_medicine_extractor_final_json.py
import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import cv2
import numpy as np
import easyocr
import re
from rapidfuzz import fuzz, process
import json
import os
from datetime import datetime

class CompleteMedicineExtractor:
    def __init__(self, trocriam1_path=r"C:\prescription_project\trocr_prescription_final_without_iam1"):
        print("🚀 Loading models...")
        self.processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
        self.model = VisionEncoderDecoderModel.from_pretrained(trocriam1_path)
        self.model.eval()
        self.reader = easyocr.Reader(['en'])
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        
        # COMPREHENSIVE MEDICINE DATABASE
        self.medicine_database = self._build_medicine_database()
        
        # Flattened list for faster fuzzy matching
        self.all_medicine_names = []
        self.medicine_lookup = {}
        for med, variations in self.medicine_database.items():
            for var in variations:
                self.all_medicine_names.append(var.lower())
                self.medicine_lookup[var.lower()] = med
        
        print(f"✅ Loaded {len(self.medicine_database)} medicines, {len(self.all_medicine_names)} variations")
    
    def _build_medicine_database(self):
        """ULTIMATE medicine database with ALL possible variations"""
        return {
            # ===== ANTIBIOTICS (including common OCR errors) =====
            'AMOXICILLIN': ['amoxicillin', 'amoxil', 'amoxicilline', 'moxicillin', 'amox', 
                           'anoxicillin', 'amoxicilin', 'amoxycillin', 'amoxcillin', 'amoxicllin',
                           'amoxicilin', 'amoxcyillin', 'amoxicyllin', 'amoxicilin', 'amoxicilln',
                           'amoxicllin', 'amoxiciliin', 'amoxacillin', 'amoxacilin', 'anoxacillin'],
            
            'AZITHROMYCIN': ['azithromycin', 'azithral', 'zithromax', 'azax', 'azithromycin', 
                            'azithromicin', 'azithromyzin', 'azithromycine', 'azithromyci'],
            
            'ERYTHROMYCIN': ['erythromycin', 'erythrocin', 'erythromicin', 'erythromycine',
                            'erythromycinethylsuccinate', 'erythromycin ethylsuccinate'],
            
            'AMPHOTERICIN': ['amphotericin', 'amphotericinb', 'fungizone', 'amphocin',
                            'amphotericin b', 'amphotericine', 'amphocil'],
            
            'CEPHALEXIN': ['cephalexin', 'keflex', 'cephaxin', 'cephalexine', 'cefalexin'],
            
            'CIPROFLOXACIN': ['ciprofloxacin', 'cipro', 'ciproxin', 'ciproflox', 'ciprofloxacine'],
            
            'DOXYCYCLINE': ['doxycycline', 'doxylin', 'vibramycin', 'doxycyclin', 'doxcycycline'],
            
            'FLUCLOXACILLIN': ['flucloxacillin', 'fluocacilin', 'floxacillin', 'fluclox', 'flucoxacillin'],
            
            'METRONIDAZOLE': ['metronidazole', 'flagyl', 'metronidazol', 'metro'],
            
            'CLARITHROMYCIN': ['clarithromycin', 'biaxin', 'klaricid', 'clarithro', 'clarithromycine'],
            
            'AUGMENTIN': ['augmentin', 'aujnenturi', 'co-amoxiclav', 'co amoxiclav', 'amoxicillin clavulanate'],
            
            # ===== PAIN KILLERS =====
            'PARACETAMOL': ['paracetamol', 'acetaminophen', 'pcm', 'crocin', 'tylenol', 'dolo', 'calpol',
                           'aretaminophen', 'paracetamole', 'paracetamol', 'paracitamol', 'paracetemol','Paracetanoftab'],
            
            'IBUPROFEN': ['ibuprofen', 'brufen', 'advil', 'motrin', 'ibugesic', 'nurofen', 'iburofen',
                         'ibuprofene', 'iboprufen', 'ibuprofin', 'iprufen'],
            
            'ASPIRIN': ['aspirin', 'ecosprin', 'disprin', 'aspro', 'acetylsalicylic acid'],
            
            'TRAMADOL': ['tramadol', 'tramazac', 'ultram', 'tramadole', 'tramadol hcl'],
            
            'DIHYDROCODEINE': ['dihydrocodeine', 'dihyrocodeine', 'dihydro', 'codeine', 'df-118'],
            
            # ===== ANTI-DIABETIC =====
            'METFORMIN': ['metformin', 'glucophage', 'glycomet', 'metformina', 'meftin', 'metformine'],
            
            'GLIBENCLAMIDE': ['glibenclamide', 'glyburide', 'daonil', 'glibenclamid'],
            
            'GLICLAZIDE': ['gliclazide', 'diamicron', 'glizide', 'gliclazid'],
            
            'TOLBUTAMIDE': ['tolbutamide', 'tolbutamid', 'tolb utamide', 'orinese', 'tolbutamid'],
            
            # ===== CARDIAC DRUGS =====
            'DIGOXIN': ['digoxin', 'dijoxin', 'digoxine', 'lanoxin', 'digox'],
            
            'ATENOLOL': ['atenolol', 'tenormin', 'atenol', 'atenolole'],
            
            'AMLODIPINE': ['amlodipine', 'norvasc', 'amlogard', 'amlodipin'],
            
            'LISINOPRIL': ['lisinopril', 'zestril', 'prinivil', 'lisinoprile'],
            
            'LOSARTAN': ['losartan', 'losnian', 'cozaar', 'losartana'],
            
            'CLOPIDOGREL': ['clopidogrel', 'plavix', 'clopidogrel bisulfate'],
            
            'METOPROLOL': ['metoprolol', 'betaloc', 'lopressor', 'bet aloc', 'beta loc'],
            
            'ENALAPRIL': ['enalapril', 'vasotec', 'enalaprila'],
            
            'FUROSEMIDE': ['furosemide', 'lasix', 'frusemide'],
            
            'SPIRONOLACTONE': ['spironolactone', 'aldactone', 'spironolacton'],
            
            'WARFARIN': ['warfarin', 'coumadin', 'warfarina'],
            
            'NITROGLYCERIN': ['nitroglycerin', 'nitrostat', 'nitrovas', 'nitro', 'ntg'],
            
            # ===== STOMACH MEDICINES =====
            'OMEPRAZOLE': ['omeprazole', 'omez', 'prilosec', 'omeprole', 'omeprazol'],
            
            'PANTOPRAZOLE': ['pantoprazole', 'pantocid', 'protonix', 'pantonix', 'pantoprazol'],
            
            'LANSOPRAZOLE': ['lansoprazole', 'lomac', 'prevacid', 'lansoprazol'],
            
            'RANITIDINE': ['ranitidine', 'zantac', 'ranitidin', 'ranitidina'],
            
            'CIMETIDINE': ['cimetidine', 'tagamet', 'cinetidine', 'cehtigine', 'cimetidin'],
            
            # ===== ANTIDEPRESSANTS =====
            'AMITRIPTYLINE': ['amitriptyline', 'elavil', 'amitrip', 'amitriptylin'],
            
            'FLUOXETINE': ['fluoxetine', 'prozac', 'fluoxetina'],
            
            'SERTRALINE': ['sertraline', 'zoloft', 'sertralina'],
            
            'CITALOPRAM': ['citalopram', 'celexa', 'citalopram'],
            
            'VENLAFAXINE': ['venlafaxine', 'effexor', 'venlafaxina'],
            
            # ===== ANTICONVULSANTS =====
            'GABAPENTIN': ['gabapentin', 'neurontin', 'gabapentina'],
            
            'PREGABALIN': ['pregabalin', 'lyrica', 'pregabalina'],
            
            # ===== YOUR SPECIFIC MEDICINES =====
            'EUDIBENE': ['eudibene', 'eudiben', 'eudibene de'],
            
            'DORZOLAMIDE': ['dorzolamide', 'dorzolamidum', 'trusopt', 'dorzolamid'],
            
            'OXPRENOLOL': ['oxprenolol', 'oxprelol', 'trasicor', 'oxprenolole'],
            
            'PANCREATOME': ['pancreatome', 'pancreatin', 'pancrelipase'],
            
            'METOCLOPRAMIDE': ['metoclopramide', 'maxolon', 'metoclopramid'],
            
            'CEFTIGINE': ['ceftigine', 'cehtigine'],
            
            'FLUOCACILIN': ['fluocacilin'],
            
            'LOSNIAN': ['losnian'],
            
            'PANTONIX': ['pantonix'],
            
            # ===== FROM YOUR TROCR OUTPUTS =====
            'BELLADONNA': ['belladonna', 'belladone', 'atropa belladonna', 'belladona'],
            
            'AMPHOGEL': ['amphogel', 'amphogiel', 'amophelgel', 'aluminum hydroxide gel'],
            
            'LEVOTHYROXINE': ['levothyroxine', 'synthroid', 'levothyroxin'],
            
            'HYDROCHLOROTHIAZIDE': ['hydrochlorothiazide', 'hctz', 'hydrochlorothiazid'],
            
            'PREDNISONE': ['prednisone', 'deltasone', 'prednisona'],

            'HEMULIN':['hrmv','Hemulin','hemulin','hemulin'],

            'NOVORAPID':['NovORApid','Novorapid','novorapid','novorapid'],

             'PHYMTOIN':['Phymtoin','phmuftan'],

             'XPQ':['Xpq','xpq','XPI'],

             "TabPantonix20mg":['Tab. Panbmix 20m9'],

            'Cinetidine':['Cinetidine50mg'],

            'Azomac':['Azomac'],

            'HYDROXYCHLOROQUINE':['THYDROXYCHLORDOSVINE'],

            'VITAMINC':['VITAMIN'],

            'Crocin':['Crocin'],

            'CETRIZINE':['CETRIZINE'],

            'MASEPRO':['Maxpro' ],

            'DORZOLAMIDUM':['Dorzolanidum'],

            'Betaloc':['Betaloc'],

            'Masepro':['Maxpro'],

        }
    
    def is_medicine(self, text):
        """Advanced medicine detection with proper fuzzy matching"""
        if not text or len(text) < 3:
            return None
        
        text_clean = re.sub(r'[^a-zA-Z]', '', text.lower())
        if len(text_clean) < 3:
            return None
        
        # METHOD 1: Direct lookup in flattened list
        if text_clean in self.medicine_lookup:
            return self.medicine_lookup[text_clean].upper()
        
        # METHOD 2: Check if text contains any medicine name
        for var, med in self.medicine_lookup.items():
            if var in text_clean or text_clean in var:
                return med.upper()
        
        # METHOD 3: Fuzzy matching with rapidfuzz
        best_match = process.extractOne(
            text_clean, 
            self.all_medicine_names,
            scorer=fuzz.ratio,
            score_cutoff=70
        )
        
        if best_match:
            matched_var = best_match[0]
            return self.medicine_lookup[matched_var].upper()
        
        # METHOD 4: Check medicine suffixes
        medicine_suffixes = ['cillin', 'mycin', 'cycline', 'oxacin', 'zole', 'prazole', 
                           'tidine', 'sartan', 'dipine', 'lol', 'pril', 'statin',
                           'formin', 'gliptin', 'gliflozin', 'navir', 'vir', 'done']
        
        for suffix in medicine_suffixes:
            if text_clean.endswith(suffix) and len(text_clean) > 5:
                # This is likely a medicine, return as-is
                return text_clean.upper()
        
        return None
    
    def extract_dosage(self, text):
        """Extract dosage information with multiple patterns"""
        if not text:
            return None
        
        text_lower = text.lower()
        
        # Multiple dosage patterns
        patterns = [
            r'(\d+\.?\d*)\s*(mg|ml|mcg|g|iu)\b',           # 50mg, 0.125mg
            r'(\d+)\s*mg\/ml',                              # 50mg/ml
            r'(\d+)\s*mg',                                   # 50 mg
            r'(\d+)\s*ml',                                   # 5 ml
            r'(\d+\.?\d*)\s*g',                              # 0.5g
            r'-\s*(\d+)(mg|ml|g)',                           # -50mg
            r'(\d+)(mg|ml|g)(?:\b|$)',                       # 50mg at end
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                if len(match.groups()) == 2:
                    return f"{match.group(1)}{match.group(2)}"
                else:
                    # Check if there's a unit in the text
                    if 'mg' in text_lower:
                        return f"{match.group(1)}mg"
                    elif 'ml' in text_lower:
                        return f"{match.group(1)}ml"
                    elif 'mcg' in text_lower:
                        return f"{match.group(1)}mcg"
                    else:
                        return f"{match.group(1)}mg"
        return None
    
    def enhance_dosage_reporting(self, medicines):
        """Post-process to ensure dosage is reported even if missed"""
        enhanced_medicines = []
        for med in medicines:
            # If dosage is None, do a more aggressive search in the original text
            if med['dosage'] is None and med['original']:
                # Look for any number followed by common units
                text = med['original'].lower()
                # Enhanced patterns
                patterns = [
                    r'(\d+)\s*(?:mg|ml|g|mcg|mcg|iu|unit)s?\b',
                    r'(\d+)\s*mg\/ml',
                    r'(\d+\.?\d*)\s*(?:mg|ml|g)',
                    r'[×x]\s*(\d+)',  # like "x 5"
                    r'(\d+)\s*(?:tab|caps?|tabs|capsules?)',
                ]
                for pattern in patterns:
                    match = re.search(pattern, text)
                    if match:
                        med['dosage'] = f"{match.group(1)}mg"  # assume mg if unit not found
                        break
            enhanced_medicines.append(med)
        return enhanced_medicines

    def extract_medicines(self, image_path):
        """Extract medicines and dosages"""
        
        print(f"\n🔍 Processing: {image_path}")
        
        # Load image
        image = Image.open(image_path).convert('RGB')
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Detect text regions
        results = self.reader.readtext(image_cv)
        
        print("\n📝 Analyzing regions...")
        
        all_predictions = []
        
        for i, (bbox, easy_text, easy_conf) in enumerate(results):
            y_coords = [point[1] for point in bbox]
            y_center = sum(y_coords) / 4
            
            pts = np.array(bbox, dtype=np.int32)
            x, y = pts.min(axis=0)
            x2, y2 = pts.max(axis=0)
            
            padding = 5
            x = max(0, x - padding)
            y = max(0, y - padding)
            x2 = min(image_cv.shape[1], x2 + padding)
            y2 = min(image_cv.shape[0], y2 + padding)
            
            region = image_cv[y:y2, x:x2]
            region_rgb = cv2.cvtColor(region, cv2.COLOR_BGR2RGB)
            region_pil = Image.fromarray(region_rgb)
            
            pixel_values = self.processor(region_pil, return_tensors="pt").pixel_values
            pixel_values = pixel_values.to(self.device)
            
            with torch.no_grad():
                generated_ids = self.model.generate(
                    pixel_values,
                    max_length=50,
                    num_beams=3
                )
                trocr_text = self.processor.decode(generated_ids[0], skip_special_tokens=True)
            
            all_predictions.append({
                'easyocr': easy_text,
                'trocr': trocr_text,
                'confidence': easy_conf,
                'y_center': y_center,
                'bbox': bbox
            })
            
            print(f"   Region {i+1}: '{easy_text}' → '{trocr_text}'")
        
        # Sort by vertical position
        all_predictions.sort(key=lambda x: x['y_center'])
        
        # Group by lines
        lines = []
        current_line = []
        last_y = None
        
        for pred in all_predictions:
            if last_y is None or abs(pred['y_center'] - last_y) < 30:
                current_line.append(pred)
            else:
                if current_line:
                    lines.append(current_line)
                current_line = [pred]
            last_y = pred['y_center']
        
        if current_line:
            lines.append(current_line)
        
        # Process each line
        medicine_dosage_map = {}
        
        for line in lines:
            # Combine text in line
            line_trocr = " ".join([p['trocr'] for p in line])
            line_easy = " ".join([p['easyocr'] for p in line])
            max_conf = max([p['confidence'] for p in line])
            
            # Check for medicine in this line
            medicine_match = self.is_medicine(line_trocr)
            if not medicine_match:
                medicine_match = self.is_medicine(line_easy)
            
            # Check for dosage
            dosage = self.extract_dosage(line_trocr)
            if not dosage:
                dosage = self.extract_dosage(line_easy)
            
            if medicine_match:
                medicine_dosage_map[medicine_match] = {
                    'name': medicine_match,
                    'original': line_trocr,
                    'confidence': max_conf * 100,
                    'dosage': dosage,
                    'easyocr': line_easy
                }
                print(f"  ✅ MEDICINE: {medicine_match} (dosage: {dosage})")
        
        medicines = list(medicine_dosage_map.values())
        
        # ===== FIXED: Call dosage enhancement HERE (inside the method) =====
        medicines = self.enhance_dosage_reporting(medicines)
        
        # Print final results
        print("\n" + "="*70)
        print("📋 FINAL PRESCRIPTION ANALYSIS")
        print("="*70)
        
        if medicines:
            for med in medicines:
                print(f"\n✅ Medicine: {med['name']}")
                print(f"   Detected as: '{med['original']}'")
                print(f"   Confidence: {med['confidence']:.1f}%")
                print(f"   💊 Dosage: {med['dosage'] if med['dosage'] else 'Not detected'}")
        else:
            print("\n❌ No medicines detected")
        
        return {
            'medicines': [m['name'] for m in medicines],
            'details': medicines
        }

# ===== NEW FUNCTION TO SAVE JSON (Doesn't change your structure) =====
def save_results_to_json(results, image_name, output_folder="json_output"):
    """Save medicine results to JSON file"""
    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    # Prepare JSON data
    json_data = {
        "image": image_name,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "medicines": []
    }
    
    # Add each medicine (just name and dosage as requested)
    for med in results['details']:
        json_data["medicines"].append({
            "name": med['name'],
            "dosage": med['dosage'] if med['dosage'] else "Not detected",
            "confidence": round(med['confidence'], 1)
        })
    
    # Save to file
    json_filename = f"{output_folder}/{image_name.replace('.jpg', '')}_result.json"
    with open(json_filename, 'w') as f:
        json.dump(json_data, f, indent=2)
    
    print(f"💾 JSON saved: {json_filename}")
    return json_filename

# ===== NEW FUNCTION TO CREATE MASTER JSON (Optional) =====
def create_master_json(all_results, output_file="all_prescriptions.json"):
    """Create a master JSON file with all results"""
    master_data = {
        "total_prescriptions": len(all_results),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "prescriptions": all_results
    }
    
    with open(output_file, 'w') as f:
        json.dump(master_data, f, indent=2)
    
    print(f"📚 Master JSON saved: {output_file}")

# Run it
if __name__ == "__main__":
    extractor = CompleteMedicineExtractor(r"C:\prescription_project\trocr_prescription_final_without_iam1")
    
    # Process multiple images
    import os
    image_folder = r"C:\INTERN MODEL\raw_datasets\prescription_clear"
    
    # Store all results for master JSON
    all_prescriptions = []
    
    for i in range(1, 21):  # Process images 1-50
        image_name = f"{i}.jpg"
        image_path = os.path.join(image_folder, image_name)
        
        if os.path.exists(image_path):
            print(f"\n{'='*80}")
            print(f"Processing: {image_name}")
            print('='*80)
            
            # Extract medicines
            result = extractor.extract_medicines(image_path)
            
            print(f"\n🎯 Found: {result['medicines']}")
            
            # Save individual JSON
            json_file = save_results_to_json(result, image_name)
            
            # Add to master list
            all_prescriptions.append({
                "image": image_name,
                "json_file": json_file,
                "medicines": result['medicines'],
                "details": [
                    {
                        "name": med['name'],
                        "dosage": med['dosage'] if med['dosage'] else None,
                        "confidence": round(med['confidence'], 1)
                    } for med in result['details']
                ]
            })
        else:
            print(f"⚠️ File {image_name} not found, skipping.")
    
    # Create master JSON with all results
    create_master_json(all_prescriptions, "all_prescriptions.json")
    
    print("\n" + "="*80)
    print("✅ ALL DONE! JSON files saved in 'json_output' folder")
    print("📋 Master file: all_prescriptions.json")
    print("="*80)